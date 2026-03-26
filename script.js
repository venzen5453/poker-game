/* =================== ⚙️ 기본 변수 설정 =================== */
let deck = [], hand = [], selected = [];

// 💾 1. 로컬 스토리지에서 저장된 돈 불러오기 (없으면 3,000원 시작)
let money = parseInt(localStorage.getItem('poker-money')) || 3000; 

let phase = "idle"; // idle, starting, draw, exchanging, mini
let miniValue = 0;
let baseCard = 0;
let miniLock = false;
let currentLang = 'ko';

/* 🔊 효과음 설정 */
const flipSoundSrc = "https://assets.mixkit.co/active_storage/sfx/1116/1116-preview.mp3";
const winSoundSrc = "https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3";
const loseSoundSrc = "https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3";
const rankSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

function playFlip() {
  const s = new Audio(flipSoundSrc);
  s.volume = 0.3;
  s.play();
}

function playSound(src, vol = 0.5) {
  const s = new Audio(src);
  s.volume = vol;
  s.play();
}

/* 🌐 다언어 데이터 (동일) */
const translations = {
  ko: { 
    title: "포커 게임", money: "자산", bet: "베팅액", start: "시작", exchange: "교환", payout: "배당표", 
    high: "높음", low: "낮음", cashout: "그만하기", double: "더블 찬스", win: "성공!", lose: "패배", draw: "무승부",
    ranks: {
      "로얄 스트레이트 플러시": "로얄 스트레이트 플러시",
      "스트레이트 플러시": "스트레이트 플러시",
      "포카드": "포카드",
      "풀하우스": "풀하우스",
      "플러시": "플러시",
      "스트레이트": "스트레이트",
      "트리플": "트리플",
      "투페어": "투페어",
      "원페어": "원페어",
      "노페어": "패배"
    },
    unit: "배"
  },
  en: { 
    title: "Poker Ace", money: "Cash", bet: "Bet", start: "Start", exchange: "Draw", payout: "Paytable", 
    high: "High", low: "Low", cashout: "Collect", double: "Double Up", win: "Win!", lose: "Lose", draw: "Push",
    ranks: {
      "로얄 스트레이트 플러시": "Royal Flush",
      "스트레이트 플러시": "Straight Flush",
      "포카드": "Four of a Kind",
      "풀하우스": "Full House",
      "플러시": "Flush",
      "스트레이트": "Straight",
      "트리플": "Three of a Kind",
      "투페어": "Two Pair",
      "원페어": "One Pair",
      "노페어": "Lose"
    },
    unit: "x"
  },
  ja: { 
    title: "ポーカーエース", money: "所持金", bet: "ベット", start: "スタート", exchange: "交換", payout: "配当表", 
    high: "高い", low: "低い", cashout: "コレクト", double: "ダブルチャンス", win: "勝利！", lose: "敗北", draw: "引き分け",
    ranks: {
      "로얄 스트레이트 플러시": "ロイヤルストレートフラッシュ",
      "스트레이트 플러시": "ストレートフラッシュ",
      "포카드": "フォー・カード",
      "풀하우스": "フルハウス",
      "플러시": "フラッシュ",
      "스트레이트": "ストレート",
      "트리플": "スリーカード",
      "투페어": "ツーペア",
      "원페어": "ワンペア",
      "노페어": "敗北"
    },
    unit: "倍"
  }
};

const payout = {
  "로얄 스트레이트 플러시": 30,
  "스트레이트 플러시": 20,
  "포카드": 10,
  "풀하우스": 7,
  "플러시": 5,
  "스트레이트": 3,
  "트리플": 2,
  "투페어": 1,
  "원페어": 0,
  "노페어": 0
};

/* 🃏 카드 기본 로직 (동일) */
const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function convertValue(v) {
  if (v === "A" || v === 1) return 14; 
  if (v === "K" || v === 13) return 13;
  if (v === "Q" || v === 12) return 12;
  if (v === "J" || v === 11) return 11;
  return parseInt(v);
}

function createDeck() {
  deck = [];
  for (let s of suits) {
    for (let v of values) { deck.push({ suit: s, value: v }); }
  }
}

function shuffle() { deck.sort(() => Math.random() - 0.5); }
function deal() { return deck.splice(0, 5); }
function drawOne() { return deck.shift(); }

function setCardColor(el, suit) {
  el.classList.remove("red");
  if (suit === "♥" || suit === "♦") el.classList.add("red");
}

/* 🖥️ 화면 렌더링 & 언어 설정 (동일) */
function changeLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  document.getElementById('ui-title').innerText = t.title;
  document.getElementById('ui-money-label').innerText = t.money;
  document.getElementById('ui-bet-label').innerText = t.bet + ":";
  document.getElementById('startBtn').innerText = t.start;
  document.getElementById('exchangeBtn').innerText = t.exchange;
  document.getElementById('ui-payout-title').innerText = t.payout;
  document.getElementById('ui-mini-title').innerText = t.double;
  document.getElementById('ui-high-btn').innerText = t.high;
  document.getElementById('ui-low-btn').innerText = t.low;
  document.getElementById('ui-cashout-btn').innerText = t.cashout;

  const payoutList = document.getElementById("payoutTable");
  payoutList.innerHTML = "";
  Object.keys(payout).forEach(rankName => {
    if (rankName === "노페어") return;
    const li = document.createElement("li");
    li.id = rankName;
    li.innerHTML = `<span>${t.ranks[rankName]}</span> <span>${payout[rankName]}${t.unit}</span>`;
    payoutList.appendChild(li);
  });
}

function render() {
  const container = document.getElementById("cards");
  container.innerHTML = "";
  
  hand.forEach((card, i) => {
    const wrap = document.createElement("div");
    wrap.className = "card";
    const inner = document.createElement("div");
    inner.className = "inner flip"; 
    
    const front = document.createElement("div");
    front.className = "front";
    front.innerText = card.value + card.suit;
    setCardColor(front, card.suit);
    
    const back = document.createElement("div");
    back.className = "back";

    inner.appendChild(front);
    inner.appendChild(back);
    wrap.appendChild(inner);

    wrap.onclick = () => { if (phase === "draw") toggleHold(i, wrap); };
    container.appendChild(wrap);

    setTimeout(() => {
      inner.classList.remove("flip");
      playFlip();
    }, i * 120 + 300);
  });
}

function toggleHold(i, el) {
  if (selected.includes(i)) {
    selected = selected.filter(x => x !== i);
    el.classList.remove("selected");
  } else {
    selected.push(i);
    el.classList.add("selected");
  }
}

/* 💾 자산 업데이트 및 스토리지 저장 함수 */
function updateMoney() { 
  document.getElementById("money").innerText = money.toLocaleString(); 
  localStorage.setItem('poker-money', money); // 현재 금액을 기기에 저장
}

/* 🚀 게임 흐름 */
function startGame() {
  if (phase !== "idle") return;
  
  const betSelect = document.getElementById("bet");
  const bet = parseInt(betSelect.value);
  
  if (money < bet) { alert(currentLang === 'ko' ? "잔액이 부족합니다." : "Insufficient funds."); return; }

  phase = "starting"; 
  betSelect.disabled = true;

  money -= bet;
  updateMoney(); // 💾 배팅 시 돈 차감 후 저장
  createDeck(); shuffle();
  hand = deal();
  selected = [];

  render();
  clearHighlight();
  
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("exchangeBtn").style.display = "inline-block";
  document.getElementById("result").innerText = "";

  setTimeout(() => { phase = "draw"; }, 1000);
}

function exchange() {
  if (phase !== "draw") return;
  phase = "exchanging";
  
  const inners = document.querySelectorAll("#cards .inner");
  const cards = document.querySelectorAll("#cards .card");

  let toExchange = [];
  for (let i = 0; i < 5; i++) {
    if (!selected.includes(i)) toExchange.push(i);
  }

  if (toExchange.length === 0) { finishGame(); return; }

  toExchange.forEach(i => inners[i].classList.add("flip"));
  playFlip();

  setTimeout(() => {
    toExchange.forEach(i => {
      hand[i] = drawOne();
      const front = inners[i].querySelector(".front");
      front.innerText = hand[i].value + hand[i].suit;
      setCardColor(front, hand[i].suit);
    });

    setTimeout(() => {
      toExchange.forEach((i, idx) => {
        setTimeout(() => {
          inners[i].classList.remove("flip");
          playFlip();
        }, idx * 150);
      });

      cards.forEach(c => c.classList.remove("selected"));
      const lastDelay = (toExchange.length * 150) + 600;
      selected = [];
      setTimeout(finishGame, lastDelay);
    }, 100);
  }, 600); 
}

function finishGame() {
  const rank = checkHand(hand);
  const bet = parseInt(document.getElementById("bet").value);
  const win = payout[rank] * bet;
  const t = translations[currentLang];

  highlightRank(rank);
  highlightCards();

  if (rank !== "노페어" && rank !== "원페어") {
    rankSound.currentTime = 0; 
    rankSound.play();
    miniValue = win;
    document.getElementById("result").innerText = `${t.ranks[rank]} (${win.toLocaleString()})`;
    setTimeout(() => startMiniGame(), 1500);
  } else {
    document.getElementById("result").innerText = t.ranks[rank];
    resetUI();
  }
}

function resetUI() {
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("exchangeBtn").style.display = "none";
  document.getElementById("bet").disabled = false;
  phase = "idle";
}

/* 🎰 미니게임 (하이로우) */
function startMiniGame() {
  phase = "mini";
  miniLock = false;
  document.getElementById("miniGame").style.display = "block";
  document.getElementById("gameArea").style.display = "none";
  baseCard = getRandomValue();
  setMiniCard("rightCard", baseCard, true);
  setMiniCard("leftCard", 0, false);
  document.getElementById("miniResult").innerText = translations[currentLang].money + ": " + miniValue.toLocaleString();
}

function guess(type) {
  if (miniLock) return;
  miniLock = true;
  
  const newCard = getRandomValue();
  const leftInner = document.getElementById("leftCard").querySelector(".inner");
  const rightInner = document.getElementById("rightCard").querySelector(".inner");
  const resultText = document.getElementById("miniResult");
  const t = translations[currentLang];

  setMiniCard("leftCard", newCard, true);

  setTimeout(() => {
    const newV = convertValue(newCard);
    const baseV = convertValue(baseCard);

    if (newCard === baseCard) {
      resultText.innerText = t.draw;
      setTimeout(() => {
        leftInner.classList.add("flip");
        rightInner.classList.add("flip");
        setTimeout(() => {
          baseCard = getRandomValue();
          setMiniCard("rightCard", baseCard, true);
          miniLock = false;
        }, 600);
      }, 800);
      return;
    }

    if ((type === "high" && newV > baseV) || (type === "low" && newV < baseV)) {
      miniValue *= 2;
      playSound(winSoundSrc);
      resultText.innerText = t.win + " " + miniValue.toLocaleString();
      setTimeout(() => {
        leftInner.classList.add("flip");
        rightInner.classList.add("flip");
        setTimeout(() => {
          baseCard = newCard; 
          setMiniCard("rightCard", baseCard, true);
          setMiniCard("leftCard", 0, false);
          miniLock = false;
        }, 600);
      }, 1500);
    } else {
      playSound(loseSoundSrc);
      resultText.innerText = t.lose;
      miniValue = 0;
      setTimeout(() => { endMini(); }, 2000);
    }
  }, 500);
}

function setMiniCard(id, val, open) {
  const el = document.getElementById(id).querySelector(".inner");
  const front = el.querySelector(".front");
  if (val !== 0) {
    const display = getCardDisplay(val);
    front.innerText = display.text;
    setCardColor(front, display.suit);
  }
  if (open) { playFlip(); el.classList.remove("flip"); }
  else el.classList.add("flip");
}

function getCardDisplay(val) {
  const map = { 1: "A", 11: "J", 12: "Q", 13: "K" };
  const display = map[val] || val;
  const suit = suits[Math.floor(Math.random() * 4)];
  return { text: display + suit, suit };
}

function getRandomValue() { return Math.floor(Math.random() * 13) + 1; }

function checkHand(hand) {
  const map = { A: 14, J: 11, Q: 12, K: 13 };
  const vals = hand.map(c => map[c.value] || parseInt(c.value));
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const arr = Object.values(counts);
  const flush = hand.every(c => c.suit === hand[0].suit);
  const sorted = [...vals].sort((a, b) => a - b);
  let straight = (new Set(sorted).size === 5 && (sorted[4] - sorted[0] === 4));
  if (JSON.stringify(sorted) === "[2,3,4,5,14]") straight = true;
  
  if (straight && flush && sorted[0] === 10) return "로얄 스트레이트 플러시";
  if (straight && flush) return "스트레이트 플러시";
  if (arr.includes(4)) return "포카드";
  if (arr.includes(3) && arr.includes(2)) return "풀하우스";
  if (flush) return "플러시";
  if (straight) return "스트레이트";
  if (arr.includes(3)) return "트리플";
  if (arr.filter(v => v === 2).length === 2) return "투페어";
  if (arr.includes(2)) return "원페어";
  return "노페어";
}

function highlightRank(rank) {
  document.querySelectorAll("#payoutTable li").forEach(li => li.classList.remove("highlight"));
  const el = document.getElementById(rank);
  if (el) el.classList.add("highlight");
}

function highlightCards() {
  const cards = document.querySelectorAll("#cards .card");
  const map = {};
  hand.forEach((c, i) => { map[c.value] = map[c.value] || []; map[c.value].push(i); });
  Object.values(map).forEach(arr => { if (arr.length >= 2) arr.forEach(i => cards[i].classList.add("win-card")); });
}

function clearHighlight() { document.querySelectorAll("#payoutTable li").forEach(li => li.classList.remove("highlight")); }

function cashOut() { 
  if (phase === "mini" && miniValue > 0) { 
    money += miniValue; 
    updateMoney(); // 💾 수익 챙길 때 저장
    endMini(); 
  } 
}

function endMini() {
  phase = "idle";
  document.getElementById("miniGame").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("exchangeBtn").style.display = "none";
  clearHighlight();
  document.getElementById("bet").disabled = false;
  miniValue = 0;
  updateMoney(); // 💾 게임 종료 시점에 최종 상태 저장
}

/* 🌙 다크모드 토글 */
function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-theme');
  document.getElementById('themeToggle').innerText = isDark ? "☀️" : "🌙";
  localStorage.setItem('poker-darkmode', isDark);
}

/* 🏁 초기화 */
document.addEventListener("DOMContentLoaded", () => {
  const betSelect = document.getElementById("bet");
  function formatBetText(num) {
    if (num >= 100000000) return (num / 100000000) + "억";
    if (num >= 10000) return (num / 10000) + "만";
    return num.toLocaleString();
  }
  for (let amt = 10; amt <= 100000000; amt *= 10) {
    const opt = document.createElement("option");
    opt.value = amt;
    opt.innerText = formatBetText(amt);
    betSelect.appendChild(opt);
  }
  betSelect.value = 10; 

  // 초기 테마 및 언어 설정
  if (localStorage.getItem('poker-darkmode') === 'true') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').innerText = "☀️";
  }
  
  changeLanguage('ko'); 
  updateMoney(); // 💾 실행 시 저장된 돈 표시

  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("exchangeBtn").onclick = exchange;
});