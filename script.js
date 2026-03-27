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

/* 🌐 다언어 데이터 */
const translations = {
  ko: { 
    title: "포커 게임", money: "자산", bet: "베팅액", start: "시작", exchange: "교환", payout: "배당표", 
    high: "높음", low: "낮음", cashout: "그만하기", double: "더블 찬스", win: "성공!", lose: "패배", draw: "무승부",
    refill: "💰 1원 받기",
    bonusInfo: "(1시간마다 500포인트 자동 지급)",
    ranks: {
      "파이브 카드": "파이브 카드",
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
    title: "Poker Game", money: "Balance", bet: "Bet", start: "Start", exchange: "Draw", payout: "Payout", 
    high: "High", low: "Low", cashout: "Cash Out", double: "Double Chance", win: "Win!", lose: "Lose", draw: "Draw",
    refill: "💰 Get 1 unit",
    bonusInfo: "(Get 500 points every hour)",
    ranks: {
      "파이브 카드": "Five of a Kind",
      "로얄 스트레이트 플러시": "Royal Flush",
      "스트레이트 플러시": "Straight Flush",
      "포카드": "Four of a Kind",
      "풀하우스": "Full House",
      "플러시": "Flush",
      "스트레이트": "Straight",
      "트리플": "Three of a Kind",
      "투페어": "Two Pair",
      "원페어": "One Pair",
      "노페어": "No Pair"
    },
    unit: "x"
  },
  ja: { 
    title: "ポーカーゲーム", money: "資産", bet: "ベット", start: "スタート", exchange: "交換", payout: "配당표", 
    high: "高い", low: "低い", cashout: "終了", double: "ダブルチャンス", win: "成功！", lose: "敗北", draw: "引き分け",
    refill: "💰 1円 ゲット",
    bonusInfo: "(1時間ごとに500ポイント自動支給)",
    ranks: {
      "파이브 카드": "ファイブカード",
      "로얄 스트레이트 플러시": "ロイヤルストレートフラッシュ",
      "스트레이트 플러시": "ストレートフラッシュ",
      "포카드": "フォーカード",
      "풀하우스": "フルハウス",
      "플러시": "フラッシュ",
      "스트레이트": "ストレート",
      "트리플": "スリーカード",
      "투페어": "ツーペア",
      "원페어": "ワンペア",
      "노페어": "ノーペア"
    },
    unit: "倍"
  }
};

const payout = {
  "파이브 카드": 100,
  "로얄 스트레이트 플러시": 50,
  "스트레이트 플러시": 30,
  "포카드": 15,
  "풀하우스": 7,
  "플러시": 5,
  "스트레이트": 3,
  "트리플": 2,
  "투페어": 1,
  "원페어": 0.5,
  "노페어": 0
};

/* 🃏 카드 기본 로직 */
const suits = ["♠", "♥", "♦", "♣"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function convertValue(v) {
  if (v === "A" || v === 1) return 14; 
  if (v === "K" || v === 13) return 13;
  if (v === "Q" || v === 12) return 12;
  if (v === "J" || v === 11) return 11;
  if (v === "JOKER") return 15; // 조커는 가장 높은 값으로 취급
  return parseInt(v);
}

function createDeck() {
  deck = [];
  for (let s of suits) {
    for (let v of values) { deck.push({ suit: s, value: v }); }
  }
  // 🃏 조커 1장 추가
  deck.push({ suit: "🃏", value: "JOKER", isJoker: true });
}

function shuffle() { deck.sort(() => Math.random() - 0.5); }
function deal() { return deck.splice(0, 5); }
function drawOne() { return deck.shift(); }

function setCardColor(el, suit, value) {
  el.classList.remove("red");
  // ♥, ♦ 문양이거나 조커일 경우 빨간색 적용
  if (suit === "♥" || suit === "♦" || value === "JOKER") el.classList.add("red");
}

/* 🖥️ 화면 렌더링 & 언어 설정 */
function changeLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  // 기본 텍스트 변경
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

  // ⭐ [중요] 1원 받기 버튼 & 보너스 문구 번역 추가
  const refillSpan = document.getElementById('ui-refill-text');
  const bonusInfoP = document.getElementById('ui-bonus-info');
  
  if (refillSpan) refillSpan.innerText = t.refill;
  if (bonusInfoP) bonusInfoP.innerText = t.bonusInfo;

  // 배당표 재생성
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

// 1. 메인 게임 화면에 카드를 그리는 함수
function render() {
  const container = document.getElementById("cards");
  container.innerHTML = "";
  
  hand.forEach((card, i) => {
    const wrap = document.createElement("div");
    wrap.className = "card";
    
    // 조커일 경우 전용 클래스 추가
    if (card.value === "JOKER") wrap.classList.add("joker-card");

    const inner = document.createElement("div");
    inner.className = "inner flip"; 
    
    const front = document.createElement("div");
    front.className = "front";
    
    // 🃏 조커라면 이미지 + 영어 텍스트 삽입
    if (card.value === "JOKER") {
      front.innerHTML = `
        <img src="jokerimg.png" class="joker-img">
        <span class="joker-text">JOKER</span>
      `;
    } else {
      front.innerText = card.value + card.suit;
    }
    
    setCardColor(front, card.suit, card.value);
    
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

function updateMoney() { 
  document.getElementById("money").innerText = money.toLocaleString(); 
  localStorage.setItem('poker-money', money);
}

/* 🚀 게임 흐름 시작 */
function startGame() {
  if (phase !== "idle") return;
  const betSelect = document.getElementById("bet");
  const bet = parseInt(betSelect.value);
  if (money < bet) { alert(currentLang === 'ko' ? "잔액이 부족합니다." : "Insufficient funds."); return; }
  phase = "starting"; 
  betSelect.disabled = true;
  money -= bet;
  updateMoney();
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
/* 🚀 게임 흐름 종료  */


// 2. 교환(Exchange) 시 조커 이미지 처리
function exchange() {
  if (phase !== "draw") return;
  phase = "exchanging";
  const inners = document.querySelectorAll("#cards .inner");
  const cards = document.querySelectorAll("#cards .card");
  let toExchange = [];
  for (let i = 0; i < 5; i++) { if (!selected.includes(i)) toExchange.push(i); }
  if (toExchange.length === 0) { finishGame(); return; }
  toExchange.forEach(i => inners[i].classList.add("flip"));
  playFlip();
  setTimeout(() => {
    toExchange.forEach(i => {
      hand[i] = drawOne();
      const wrap = cards[i];
      const front = inners[i].querySelector(".front");
      
      // 교환된 카드가 조커일 경우 처리
      wrap.classList.remove("joker-card");
      if (hand[i].value === "JOKER") {
        wrap.classList.add("joker-card");
        front.innerHTML = `
          <img src="jokerimg.png" class="joker-img">
          <span class="joker-text">JOKER</span>
        `;
      } else {
        front.innerHTML = ""; // 기존 이미지 제거
        front.innerText = hand[i].value + hand[i].suit;
      }
      setCardColor(front, hand[i].suit, hand[i].value);
    });
    setTimeout(() => {
      toExchange.forEach((i, idx) => {
        setTimeout(() => { inners[i].classList.remove("flip"); playFlip(); }, idx * 150);
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

  // 1. 당첨금이 있을 때 (원페어 이상)
  if (win > 0) {
    rankSound.currentTime = 0; 
    rankSound.play();
    
    // 결과 텍스트 표시
    document.getElementById("result").innerText = `${t.ranks[rank]} (${win.toLocaleString()})`;

    // 🔴 [핵심 조건] 배당이 2배 이상(투페어 이상)인 경우만 미니게임 진입
    if (payout[rank] >= 1) {
      miniValue = win; // 미니게임에서 불릴 금액 설정
      setTimeout(() => startMiniGame(), 1500); 
    } 
    // 🟡 원페어(1배)인 경우 미니게임 없이 즉시 정산
    else {
      money += win; // 자산에 즉시 합산
      updateMoney();
      setTimeout(() => resetUI(), 1500); // 1.5초 후 다시 시작 버튼 활성화
    }
  } 
  // 2. 꽝(노페어)일 때
  else {
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


/* 2. 미니게임 카드 렌더링 (조커 로직 삭제) */
function setMiniCard(id, val, open) {
  const wrap = document.getElementById(id);
  const el = wrap.querySelector(".inner");
  const front = el.querySelector(".front");
  
  // 혹시 남아있을지 모를 조커 스타일 및 내용 초기화
  wrap.classList.remove("joker-card");
  front.innerHTML = ""; 

  if (val !== 0) {
    // 일반 카드 표시 데이터 가져오기
    const display = getCardDisplay(val);
    front.innerText = display.text;
    
    // 색상 설정 (빨간색/검은색)
    setCardColor(front, display.suit, "");
  }

  if (open) { 
    playFlip(); 
    el.classList.remove("flip"); 
  } else {
    el.classList.add("flip");
  }
}

/* 3. 카드 표시 텍스트 생성 (안전장치) */
function getCardDisplay(val) {
  const map = { 1: "A", 11: "J", 12: "Q", 13: "K" };
  const display = map[val] || val;
  // 일반적인 4개 문양 중 하나를 무작위 선택
  const suits = ["♠", "♥", "♦", "♣"];
  const suit = suits[Math.floor(Math.random() * 4)];
  return { text: display + suit, suit: suit };
}

/* 1. 미니게임 랜덤 값 생성 (조커 제외: 1~13만 반환) */
function getRandomValue() { 
  // 1(A)부터 13(K)까지만 랜덤하게 나옵니다.
  return Math.floor(Math.random() * 13) + 1; 
}

/* 🃏 조커 포함 족보 판정 로직 (파이브 카드 추가 버전) */
function checkHand(hand) {
  const jokerCount = hand.filter(c => c.value === "JOKER").length;
  const normalCards = hand.filter(c => c.value !== "JOKER");
  
  const map = { A: 14, J: 11, Q: 12, K: 13 };
  const vals = normalCards.map(c => map[c.value] || parseInt(c.value)).sort((a, b) => a - b);
  
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const countArr = Object.values(counts).sort((a, b) => b - a);

  // 플러시 & 스트레이트 기본 판정 로직
  const isFlush = new Set(normalCards.map(c => c.suit)).size <= 1;
  const uniqueVals = [...new Set(vals)];
  let isStraight = false;

  if (jokerCount === 0) {
    isStraight = (uniqueVals.length === 5 && (vals[4] - vals[0] === 4)) || JSON.stringify(vals) === "[2,3,4,5,14]";
  } else {
    if (uniqueVals.length === 4) {
      isStraight = (vals[3] - vals[0] <= 4);
      const backStraightCheck = [[2,3,4,14], [2,3,5,14], [2,4,5,14], [3,4,5,14]];
      if (backStraightCheck.some(arr => JSON.stringify(uniqueVals) === JSON.stringify(arr))) isStraight = true;
    }
  }

  // ========================================================
  // 🏆 [중요] 족보 판정 시작 - 순서가 절대적으로 중요합니다!
  // ========================================================

  // 1. 파이브 카드 (조커 1장 + 나머지 4장이 동일 숫자)
  // 조커가 있을 때, 가장 많은 숫자의 개수(countArr[0])가 4라면 5개가 완성됩니다.
  if (jokerCount > 0 && countArr[0] === 4) {
    return "파이브 카드"; 
  }

  // 2. 로얄 스트레이트 플러시
  if (isStraight && isFlush && (vals.includes(14) || jokerCount > 0) && (vals[0] >= 10 || (jokerCount > 0 && vals[0] >= 9))) {
    return "로얄 스트레이트 플러시";
  }

  // 3. 스트레이트 플러시
  if (isStraight && isFlush) return "스트레이트 플러시";

  // 4. 포카드 (조커 포함 4개)
  if (countArr[0] + jokerCount >= 4) return "포카드";

  // 5. 풀하우스
  if ((countArr[0] === 3 && countArr[1] === 2) || (jokerCount === 1 && countArr[0] === 2 && countArr[1] === 2)) {
    return "풀하우스";
  }

  // 6. 플러시
  if (isFlush) return "플러시";

  // 7. 스트레이트
  if (isStraight) return "스트레이트";

  // 8. 트리플
  if (countArr[0] + jokerCount >= 3) return "트리플";

  // 9. 투페어
  if (countArr.filter(v => v === 2).length === 2) return "투페어";

  // 10. 원페어
  if (countArr[0] + jokerCount >= 2) return "원페어";

  return "노페어";
}

function highlightRank(rank) {
  document.querySelectorAll("#payoutTable li").forEach(li => li.classList.remove("highlight"));
  const el = document.getElementById(rank);
  if (el) el.classList.add("highlight");
}

function highlightCards() {
  const cards = document.querySelectorAll("#cards .card");
  const valMap = {};
  hand.forEach((c, i) => { 
    const v = c.value;
    valMap[v] = valMap[v] || [];
    valMap[v].push(i);
  });
  // 조커는 무조건 강조, 페어 이상 숫자들도 강조
  hand.forEach((c, i) => {
    if (c.value === "JOKER") cards[i].classList.add("win-card");
  });
  Object.values(valMap).forEach(arr => { if (arr.length >= 2) arr.forEach(i => cards[i].classList.add("win-card")); });
}

function clearHighlight() { 
  document.querySelectorAll("#payoutTable li").forEach(li => li.classList.remove("highlight")); 
  document.querySelectorAll("#cards .card").forEach(c => c.classList.remove("win-card"));
}

function cashOut() { 
  if (phase === "mini" && miniValue > 0) { 
    money += miniValue; 
    updateMoney();
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
  updateMoney();
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-theme');
  document.getElementById('themeToggle').innerText = isDark ? "☀️" : "🌙";
  localStorage.setItem('poker-darkmode', isDark);
}

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
  if (localStorage.getItem('poker-darkmode') === 'true') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggle').innerText = "☀️";
  }
  changeLanguage('ko'); 
  updateMoney();
  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("exchangeBtn").onclick = exchange;
});


// 페이지가 로드된 후 실행
document.addEventListener("DOMContentLoaded", () => {
  const refillBtn = document.getElementById("clickRefillBtn");

  // 1. 클릭 시 1원 충전
  if (refillBtn) {
    refillBtn.onclick = () => {
      money += 1;
      updateMoney(); // 화면의 자산 표시를 갱신하는 함수
    };
  }

  // 2. 1시간(3600초)마다 500원 자동 충전
  setInterval(() => {
    money += 500;
    updateMoney();
    // 콘솔에만 기록 (개발자 도구에서 확인 가능, 화면에는 안 보임)
    console.log("🎁 Hourly bonus 500 added.");
    
  }, 3600 * 1000); // 3600초 * 1000ms
});

// 핀치 줌(두 손가락) 방지
document.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false }); // passive를 false로 해야 preventDefault가 작동함

// 더블 탭 확대 방지
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);