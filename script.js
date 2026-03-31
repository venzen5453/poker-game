/* =================== ⚙️ 기본 변수 설정 =================== */
let deck = [], hand = [], selected = [];

// 💾 1. 로컬 스토리지에서 저장된 돈 불러오기 (없으면 3,000원 시작)
let jackpot = 0;      // 항상 0으로 시작
let money = 3000

let gameCount = Number(localStorage.getItem('poker-game-count')) || 0;

// 🔊 [추가] 전역 볼륨 변수 (기본값 0.5)
let savedVolume = localStorage.getItem('poker-volume');
let globalVolume = savedVolume !== null ? Number(savedVolume) : 0.5;

let phase = "idle"; // idle, starting, draw, exchanging, mini
let miniValue = 0;
let baseCard = 0;
let miniLock = false;
let currentLang = 'ko';

let isDarkMode = localStorage.getItem('poker-dark-theme') === 'true';

// 🎨 초기 테마 적용: isDarkMode가 true일 때만 클래스 추가
if (isDarkMode) {
    document.body.classList.add('dark-theme');
} else {
    document.body.classList.remove('dark-theme');
}

/* 🔊 효과음 설정 */
const flipSoundSrc = "https://assets.mixkit.co/active_storage/sfx/1116/1116-preview.mp3";
const winSoundSrc = "https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3";
const loseSoundSrc = "https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3";
const rankSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

function playFlip() {
  const s = new Audio(flipSoundSrc);
  s.volume = globalVolume * 1.0; 
  s.play().catch(() => {}); 
}

function playSound(src, vol = 1.0) {
  const s = new Audio(src);
  s.volume = globalVolume * 0.45; 
  s.play().catch(() => {});
}

function playRankSound() {
  rankSound.volume = globalVolume * 0.5;
  rankSound.play().catch(() => {});
}

/* 🌐 다언어 데이터 */
const translations = {
  ko: { 
    title: "포커 게임", money: "자산", bet: "베팅액", start: "시작", exchange: "교환", payout: "배당표", 
    high: "높음", low: "낮음", cashout: "그만하기", double: "더블 찬스", win: "성공!", lose: "패배", draw: "무승부",
    units: { tr: "조", bill: "억", man: "만" },
    refill: "❓ 게임 방법",
    bonusInfo: "(1시간마다 500포인트 자동 지급)",
    options: "옵션",
    langLabel: "언어 설정 (Language)",
    themeLabel: "테마 설정 (Dark/Light)",
    volLabel: "소리 크기 (Volume)",
    saveClose: "저장 및 닫기",
    miniQuery: "축하합니다!\n미니게임에 도전하시겠습니까?\n승리시 2배",
    miniWin: "승리! 금액이 2배가 되었습니다.\n한 번 더 도전하시겠습니까?",
    jackpotAlert: "🎊 대박! 풀하우스 이상 달성! 잭팟 {amount}을 획득했습니다! 🎊",
    accept: "수락",
    reject: "거절",
    feverAlert: "🔥 피버 타임! 조커 등장 확률 상승!", // 추가
    insufficient: "잔액이 부족합니다.",
    
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
    title: "Poker Game", money: "funds", bet: "Bet", start: "Start", exchange: "Draw", payout: "Payout", 
    high: "High", low: "Low", cashout: "Cash Out", double: "Double Chance", win: "Win!", lose: "Lose", draw: "Draw",
    units: { tr: "T", bill: "B", mil: "M", k: "K" },
    refill: "❓ How to Play",
    bonusInfo: "(Get 500 points every hour)",
    options: "Settings",
    langLabel: "Language Settings",
    themeLabel: "Theme (Dark/Light)",
    volLabel: "Volume",
    saveClose: "Save & Close",
    miniQuery: "Congratulations!\nWould you like to play the mini-game?\n2x upon victory",
    miniWin: "Win! Your prize has doubled.\nTry again?",
    jackpotAlert: "🎊 JACKPOT! You've won an extra {amount} with a Full House or higher! 🎊",
    accept: "Accept",
    reject: "Decline",
    feverAlert: "🔥 FEVER TIME! Higher Joker Chance!", // 추가
    insufficient: "Insufficient funds.",

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
    title: "ポーカーゲーム", money: "資産", bet: "ベット", start: "スタート", exchange: "交換", payout: "配当表", 
    high: "ハイ", low: "ロー", cashout: "終了", double: "ダブルチャンス", win: "成功！", lose: "敗北", draw: "引き分け",
    units: { tr: "兆", bill: "億", man: "万" },
    refill: "❓ 遊び方",
    bonusInfo: "(1時間ごとに500ポイント自動支給)",
    options: "オプション",
    langLabel: "言語設定 (Language)",
    themeLabel: "テーマ設定 (Dark/Light)",
    volLabel: "音量 (Volume)",
    saveClose: "保存して閉じる",
    miniQuery: "おめでとうございます！\nミニゲームに挑戦しますか？\n勝利時2倍",
    miniWin: "勝利！賞金が2倍になりました。\nもう一度挑戦しますか？",
    jackpotAlert: "🎊 ジャックポット発生！フルハウス以上達成で {amount}獲得！ 🎊",
    accept: "はい",
    reject: "いいえ",
    feverAlert: "🔥 フィーバータイム！ジョーカー出現率アップ！", // 추가
    insufficient: "残高が不足しています。",

    ranks: {
      "파이브 카드": "ファイ브카드",
      "로얄 스트레이트 플러시": "ロイヤルストレート<br>フラッシュ",
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
  if (v === "JOKER") return 15;
  if (v === "A") return 14; 
  if (v === "K") return 13;
  if (v === "Q") return 12;
  if (v === "J") return 11;
  const num = parseInt(v);
  return isNaN(num) ? 0 : num; 
}

// 🔥 [수정] 조커는 무조건 1장만! 대신 피버 타임엔 조커를 덱의 앞쪽으로 보냄
function createDeck(fever) {
  deck = [];
  const suits = ["♠", "♥", "♦", "♣"];
  const cardValues = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  // 1. 일반 카드 생성
  for (let s of suits) {
    for (let v of cardValues) { 
      deck.push({ suit: s, value: v }); 
    }
  }

// 2. 조커 투입 (무조건 딱 1장만 넣음)
  const jokerCard = { suit: "🃏", value: "JOKER", isJoker: true };
  deck.push(jokerCard);

  // 3. 셔플 실행
  shuffle();

  // 4. 🔥 피버 타임 특수 보정
  // 만약 피버 타임이라면, 조커가 덱의 맨 앞(5장 이내)에 올 확률을 강제로 만듭니다.
  if (fever) {
    // 덱 어딘가에 있는 조커의 인덱스를 찾음
    const jokerIndex = deck.findIndex(card => card.isJoker);
    // 조커를 덱에서 잠시 뺌
    const pulledJoker = deck.splice(jokerIndex, 1)[0];
    
    // 조커를 앞쪽 0~4번 위치 중 하나에 무작위로 끼워넣음 (무조건 첫 패에 등장)
    const luckyPos = Math.floor(Math.random() * 5);
    deck.splice(luckyPos, 0, pulledJoker);
  }
}

function shuffle() { deck.sort(() => Math.random() - 0.5); }
function deal() { return deck.splice(0, 5); }
function drawOne() { return deck.shift(); }

function setCardColor(el, suit, value) {
  el.classList.remove("red");
  if (suit === "♥" || suit === "♦" || value === "JOKER") el.classList.add("red");
}

/* 🖥️ 화면 렌더링 & 언어 설정 */
function changeLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  
  if (document.getElementById('ui-options-text')) document.getElementById('ui-options-text').innerText = t.options;
  if (document.getElementById('ui-settings-title')) document.getElementById('ui-settings-title').innerText = "⚙️ " + t.options;
  if (document.getElementById('ui-lang-label')) document.getElementById('ui-lang-label').innerText = t.langLabel;
  if (document.getElementById('ui-theme-label')) document.getElementById('ui-theme-label').innerText = t.themeLabel;
  if (document.getElementById('ui-vol-label')) document.getElementById('ui-vol-label').innerText = t.volLabel;
  if (document.getElementById('settingsCloseBtn')) document.getElementById('settingsCloseBtn').innerText = t.saveClose;

  document.getElementById('ui-title').innerText = t.title;
  document.getElementById('ui-money-label').innerText = t.money;
  document.getElementById('ui-bet-label').innerText = t.bet + ":";
  document.getElementById('startBtn').innerText = t.start;
  document.getElementById('exchangeBtn').innerText = t.exchange;
  document.getElementById('ui-payout-title').innerText = t.payout;
  document.getElementById('ui-mini-title').innerText = t.double;
  document.getElementById('ui-high-btn').innerText = t.high;
  document.getElementById('ui-low-btn').innerText = t.low;

  const cashoutBtn = document.getElementById('ui-cashout-btn');
  if (cashoutBtn) cashoutBtn.innerText = t.cashout;

  const confirmUI = document.getElementById("miniConfirmUI");
  if (confirmUI && confirmUI.style.display === "block") {
    const msgEl = document.getElementById("confirmMsg");
    const accBtn = document.getElementById("acceptBtn");
    const rejBtn = document.getElementById("rejectBtn");

    if (typeof miniValue !== 'undefined' && miniValue > 0) {
      msgEl.innerText = `${t.miniWin}\n(${t.money}: ${miniValue.toLocaleString()})`;
    } else {
      msgEl.innerText = t.miniQuery;
    }
    accBtn.innerText = t.accept;
    rejBtn.innerText = t.reject;
  }

  const betSelect = document.getElementById("bet");
  if (betSelect) {
    const currentValue = betSelect.value;
    betSelect.innerHTML = "";
    for (let amt = 10; amt <= 1000000000000000; amt *= 10) {
      const opt = document.createElement("option");
      opt.value = amt;
      opt.innerText = formatBetText(amt); 
      betSelect.appendChild(opt);
    }
    betSelect.value = currentValue;
  }

  const howToSpan = document.getElementById('ui-refill-text') || document.getElementById('ui-how-to-text');
  if (howToSpan) howToSpan.innerText = t.refill; 
  const bonusInfoP = document.getElementById('ui-bonus-info');
  if (bonusInfoP) bonusInfoP.innerText = t.bonusInfo;

  const payoutList = document.getElementById("payoutTable");
  if (payoutList) {
    payoutList.innerHTML = "";
    Object.keys(payout).forEach(rankName => {
      if (rankName === "노페어") return;
      const li = document.createElement("li");
      li.id = rankName;
      const rankTitle = (t.ranks && t.ranks[rankName]) ? t.ranks[rankName] : rankName;
      li.innerHTML = `<span>${rankTitle}</span> <span>${payout[rankName]}${t.unit || ''}</span>`;
      payoutList.appendChild(li);
    });
  }

  updateMoney();
}

function render() {
  const container = document.getElementById("cards");
  if (!container) return; 
  container.innerHTML = "";
  
  const resultText = checkHand(hand); 
  const resultElement = document.getElementById("result");
  if (resultElement) resultElement.innerText = resultText;

  hand.forEach((card, i) => {
    const wrap = document.createElement("div");
    wrap.className = "card";
    const isJoker = (card.value === "JOKER");
    if (isJoker) wrap.classList.add("joker-card");

    if (window.winCards && window.winCards.length > 0) {
      const isWin = window.winCards.some(wc => wc.value === card.value && wc.suit === card.suit);
      if (isWin) wrap.classList.add("win-card");
    }

    const inner = document.createElement("div");
    inner.className = "inner flip"; 
    
    const front = document.createElement("div");
    front.className = "front";
    if (isJoker) {
      front.innerHTML = `<img src="jokerimg.png" class="joker-img"><span class="joker-text">JOKER</span>`;
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
  const moneyElem = document.getElementById("money");
  if (moneyElem) moneyElem.innerText = Number(money || 0).toLocaleString(); 

  const jackpotElem = document.getElementById("jackpot-amount");
  if (jackpotElem) {
    jackpotElem.innerText = Number(jackpot || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  localStorage.setItem('poker-money', money);
  localStorage.setItem('poker-jackpot', jackpot);
  localStorage.setItem('poker-game-count', gameCount);
}

/* 🚀 게임 흐름 시작 */
let isJackpotWon = false;
let isFeverTime = false;

function startGame() {
  if (phase !== "idle") return;
  isJackpotWon = false;
  const betSelect = document.getElementById("bet");
  const bet = parseInt(betSelect.value);

  if (money < bet) { 
    alert(translations[currentLang].insufficient); 
    return; 
  }

  phase = "starting";
  betSelect.disabled = true;
  money -= bet;
  
  updateMoney(); 

  // 🔥 [피버 타임 로직] 10판마다 조커 확률 상승
  gameCount = (gameCount || 0) + 1;
  if (gameCount % 10 === 0) {
    isFeverTime = true;
    document.body.classList.add("fever-mode");
    alert(translations[currentLang].feverAlert);
  } else {
    isFeverTime = false;
    document.body.classList.remove("fever-mode");
  }

  // 🃏 덱 생성 시 피버 여부 전달
  createDeck(isFeverTime); 
  shuffle();

  hand = deal();

  selected = [];
  render();
  clearHighlight();

  document.getElementById("startBtn").style.display = "none";
  document.getElementById("exchangeBtn").style.display = "inline-block";
  document.getElementById("result").innerText = "";

// 카드와 버튼까지 포함해서 스크롤
setTimeout(() => {
  const gameArea = document.getElementById("gameArea");
  if (gameArea) {
    const rect = gameArea.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.bottom - window.innerHeight + 20; 
    window.scrollTo({ top: scrollTop, behavior: 'smooth' });
  }
}, 500); // 렌더링 후 약간의 딜레이

// draw 단계와 autoHold
setTimeout(() => { 
  phase = "draw"; 
  autoHold(); 
}, 1500);
}

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
      wrap.classList.remove("joker-card");
      if (hand[i].value === "JOKER") {
        wrap.classList.add("joker-card");
        front.innerHTML = `<img src="jokerimg.png" class="joker-img"><span class="joker-text">JOKER</span>`;
      } else {
        front.innerHTML = ""; 
        front.innerText = hand[i].value + hand[i].suit;
      }
      setCardColor(front, hand[i].suit, hand[i].value);
    });
    setTimeout(() => {
      toExchange.forEach((i, idx) => {
        setTimeout(() => { inners[i].classList.remove("flip"); playFlip(); }, idx * 150);
      });
      cards.forEach(c => c.classList.remove("selected"));
      selected = [];
      setTimeout(finishGame, (toExchange.length * 150) + 600);
    }, 100);
  }, 600); 
}

function finishGame() {
  const rank = checkHand(hand);
  const betValue = parseInt(document.getElementById("bet").value) || 0;
  const t = translations[currentLang]; 
  
  // 🔥 [정리] 피버 타임 배당 1.5배 보너스 로직 삭제
  let multiplier = payout[rank] || 0;
  let win = Math.round(multiplier * betValue);
  
  let isJackpotWonLocal = false;
  const jackpotRanks = ["풀하우스", "포카드", "스트레이트 플러시", "로얄 스트레이트 플러시", "파이브 카드"];

  if (jackpotRanks.includes(rank)) {
    if (jackpot > 0) {
      isJackpotWonLocal = true;
      const formattedJackpot = Number(jackpot).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      alert(t.jackpotAlert.replace("{amount}", formattedJackpot));
      win += jackpot;   
      jackpot = 0;      
    }
  }

  highlightRank(rank);
  highlightCards();
  const resultEl = document.getElementById("result");

  if (win > 0) {
    rankSound.play();
    const jackpotText = isJackpotWonLocal ? " [JACKPOT!] " : "";
    resultEl.innerText = `${t.ranks[rank]}${jackpotText} (${win.toLocaleString()}) - ${multiplier}${t.unit}`;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    

    const contribution = isJackpotWonLocal ? 0 : (win * 0.02);
    if (multiplier >= 1) {
      miniValue = win; 
      setTimeout(() => {
        showCustomConfirm(t.miniQuery, 
          () => startMiniGame(), 
          () => { 
            jackpot = Number(jackpot || 0) + contribution;
            money += win; 
            updateMoney(); 
            resetUI(); 
          }
        );
      }, 1000);
    } else {
      jackpot = Number(jackpot || 0) + contribution;
      money += win;
      updateMoney(); 
      setTimeout(resetUI, 1500);
    }
  } else {
     // 패배 메시지에도 스크롤 추가
  resultEl.innerText = t.ranks[rank];
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  resetUI();
}
}

function resetUI() {
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("exchangeBtn").style.display = "none";
  document.getElementById("bet").disabled = false;
  phase = "idle";
  
}

function autoHold() {
  const currentRank = checkHand(hand);
  if (currentRank !== (currentLang === 'ko' ? "노페어" : "No Pair")) {
    hand.forEach((card, index) => {
      if (card.value === "JOKER" || (window.winCards && window.winCards.some(w => w.value === card.value && w.suit === card.suit))) {
        if (!selected.includes(index)) {
          selected.push(index);
          const cardEl = document.querySelectorAll(".card")[index];
          if(cardEl) cardEl.classList.add("selected");
        }
      }
    });
  }
}

/* 🎰 미니게임 (하이로우) */
function startMiniGame() {
  phase = "mini";
  miniLock = false;
  const miniGameArea = document.getElementById("miniGame");
  const gameArea = document.getElementById("gameArea");
  miniGameArea.style.display = "block";
  gameArea.style.display = "none";
  setTimeout(() => { miniGameArea.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);

  baseCard = getRandomValue();
  setMiniCard("rightCard", baseCard, true);
  setMiniCard("leftCard", 0, false);
  document.getElementById("miniResult").innerText = translations[currentLang].money + ": " + miniValue.toLocaleString();
}

function guess(type) {
  if (miniLock) return;
  miniLock = true; 

  let newCard;
  do {
    newCard = getRandomValue();
  } while (newCard === baseCard);

  const leftInner = document.getElementById("leftCard").querySelector(".inner");
  const rightInner = document.getElementById("rightCard").querySelector(".inner");
  const resultText = document.getElementById("miniResult");
  const t = translations[currentLang]; 

  setMiniCard("leftCard", newCard, true);

  setTimeout(() => {
    const newV = convertValue(newCard);
    const baseV = convertValue(baseCard);

    // ❌ 이거 삭제
    // if (newCard === baseCard) { ... }

    if ((type === "high" && newV > baseV) || (type === "low" && newV < baseV)) {
      miniValue *= 2;
      playSound(winSoundSrc);
      resultText.innerText = t.win + " " + miniValue.toLocaleString();

      setTimeout(() => {
        showCustomConfirm(
          `${t.miniWin}\n(${t.money}: ${miniValue.toLocaleString()})`, 
          () => {
            leftInner.classList.add("flip"); 
            setTimeout(() => {
              baseCard = newCard;
              setMiniCard("rightCard", baseCard, true);
              setMiniCard("leftCard", 0, false);
              miniLock = false;
              resultText.innerText = t.money + ": " + miniValue.toLocaleString();
            }, 600);
          },
          () => {
            jackpot = Number(jackpot || 0) + (miniValue * 0.02);
            money += miniValue;
            updateMoney();
            endMini();
          }
        );
      }, 1000);

    } else {
      playSound(loseSoundSrc);
      resultText.innerText = t.lose;
      updateMoney(); 
      setTimeout(endMini, 2000);
    }

  }, 500);
}

function showCustomConfirm(message, onAccept, onReject) {
  const ui = document.getElementById("miniConfirmUI");
  const msgEl = document.getElementById("confirmMsg");
  const accBtn = document.getElementById("acceptBtn");
  const rejBtn = document.getElementById("rejectBtn");
  const t = translations[currentLang];
  msgEl.innerText = message;
  accBtn.innerText = t.accept;
  rejBtn.innerText = t.reject;
  ui.style.display = "block";
  accBtn.onclick = () => { ui.style.display = "none"; onAccept(); };
  rejBtn.onclick = () => { ui.style.display = "none"; onReject(); };
}

function setMiniCard(id, val, open) {
  const wrap = document.getElementById(id);
  const el = wrap.querySelector(".inner");
  const front = el.querySelector(".front");
  wrap.classList.remove("joker-card");
  front.innerHTML = ""; 
  if (val !== 0) {
    const display = getCardDisplay(val);
    front.innerText = display.text + display.suit;
    setCardColor(front, display.suit, "");
  }
  if (open) { playFlip(); el.classList.remove("flip"); } else { el.classList.add("flip"); }
}

function getCardDisplay(val) {
  const suits = ["♠", "♥", "♦", "♣"];
  const suit = suits[Math.floor(Math.random() * 4)];

  let text = val;

  if (val === 1) text = "A";
  else if (val === 13) text = "K";
  else if (val === 12) text = "Q";
  else if (val === 11) text = "J";

  return { text: text, suit: suit };
}

function getRandomValue() { 
  return Math.floor(Math.random() * 13) + 1;
}

function convertValue(val) {
  return val === 1 ? 14 : val;
}

function checkHand(hand) {
  let resultText = "노페어";
  window.winCards = []; 
  if (!hand || hand.length === 0) return "노페어";

  const jokerCount = hand.filter(c => c.value === "JOKER").length;
  const normalCards = hand.filter(c => c.value !== "JOKER");
  const valMap = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };

  // 1. 숫자 분석 (정렬)
  const vals = normalCards.map(c => valMap[c.value] || parseInt(c.value)).sort((a, b) => a - b);
  const uniqueVals = [...new Set(vals)];
  
  // 2. 개수 분석
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
  const countEntries = Object.entries(counts).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]));
  const countArr = countEntries.map(e => e[1]);

  // 3. 플러시 판정
  const isFlush = normalCards.length === 0 ? (jokerCount >= 5) : 
                  (new Set(normalCards.map(c => c.suit)).size === 1 && (normalCards.length + jokerCount >= 5));

  // 4. 스트레이트 판정
  let isStraight = false;
  if (uniqueVals.length + jokerCount >= 5) {
    if (uniqueVals.length > 0) {
      const minV = uniqueVals[0];
      const maxV = uniqueVals[uniqueVals.length - 1];
      // 일반 스트레이트 (연속된 5개 숫자 범위 안에 들어오는지)
      if (maxV - minV <= 4) isStraight = true;
      // 백 스트레이트 (A, 2, 3, 4, 5)
      const lowCards = uniqueVals.filter(v => v <= 5);
      if (uniqueVals.includes(14) && (lowCards.length + jokerCount >= 4)) {
        if (lowCards.length === 0 || Math.max(...lowCards) <= 5) isStraight = true;
      }
    } else if (jokerCount >= 5) isStraight = true;
  }

  // 5. [족보 결정] 배당표 순서대로 판정
  
  // 1️⃣ 파이브 카드
  if ((countArr[0] || 0) + jokerCount >= 5) {
    window.winCards = [...hand];
    resultText = "파이브 카드";
  } 
  // 2️⃣ 로얄 스트레이트 플러시 / 3️⃣ 스트레이트 플러시
  else if (isStraight && isFlush) {
    window.winCards = [...hand];
    // 모든 일반 카드가 10 이상(10, J, Q, K, A)이면 로티플
    const isAllHigh = normalCards.every(c => valMap[c.value] >= 10);
    const isWheel = uniqueVals.includes(14) && uniqueVals.some(v => v <= 5);
    
    if (isAllHigh && !isWheel) resultText = "로얄 스트레이트 플러시";
    else resultText = "스트레이트 플러시";
  } 
  // 4️⃣ 포카드
  else if ((countArr[0] || 0) + jokerCount >= 4) {
    const targetVal = countEntries[0] ? countEntries[0][0] : "JOKER";
    window.winCards = hand.filter(c => (valMap[c.value] || parseInt(c.value)) == targetVal || c.value === "JOKER");
    resultText = "포카드";
  } 
  // 5️⃣ 풀하우스
  else if ((countArr[0] === 3 && countArr[1] === 2) || 
           (jokerCount === 1 && countArr[0] === 2 && countArr[1] === 2) ||
           (jokerCount === 1 && countArr[0] === 3)) {
    window.winCards = [...hand];
    resultText = "풀하우스";
  } 
  // 6️⃣ 플러시
  else if (isFlush) {
    window.winCards = [...hand];
    resultText = "플러시";
  } 
  // 7️⃣ 스트레이트
  else if (isStraight) {
    window.winCards = [...hand];
    resultText = "스트레이트";
  } 
  // 8️⃣ 트리플
  else if ((countArr[0] || 0) + jokerCount >= 3) {
    const targetVal = countEntries[0] ? countEntries[0][0] : "JOKER";
    window.winCards = hand.filter(c => (valMap[c.value] || parseInt(c.value)) == targetVal || c.value === "JOKER");
    resultText = "트리플";
  } 
  // 9️⃣ 투페어
  else if (countArr.filter(v => v === 2).length === 2 || (jokerCount === 1 && countArr[0] === 2 && countArr.length >= 2)) {
    // 조커가 1장 있을 때 원페어가 있으면 사실상 트리플이 되지만, 
    // 로직상 투페어 우선순위가 낮으므로 트리플이 안될 경우만 투페어로 체크
    const pairVals = countEntries.filter(e => e[1] >= 2).map(e => e[0]);
    window.winCards = hand.filter(c => pairVals.includes(String(valMap[c.value] || c.value)) || c.value === "JOKER");
    resultText = "투페어";
  } 
  // 🔟 원페어
  else if ((countArr[0] || 0) + jokerCount >= 2) {
    const targetVal = countEntries[0] ? countEntries[0][0] : null;
    window.winCards = hand.filter(c => c.value === "JOKER" || (targetVal && (valMap[c.value] || parseInt(c.value)) == targetVal));
    resultText = "원페어";
  }

  if (typeof highlightRank === 'function') highlightRank(resultText);
  return resultText; 
}

function highlightRank(rank) {
  if (typeof rank !== "string") return; 
  document.querySelectorAll("#payoutTable li").forEach(li => li.classList.remove("highlight"));
  if (!rank || rank === "노페어") return;
  let searchId = rank;
  const el = document.getElementById(searchId);
  if (el) el.classList.add("highlight");
}

function highlightCards() {
  const cardElements = document.querySelectorAll("#cards .card");
  cardElements.forEach(card => card.classList.remove("win-card"));
  if (!winCards || winCards.length === 0) return;
  hand.forEach((cardObj, index) => {
    const isWinCard = winCards.some(winObj => winObj.value === cardObj.value && winObj.suit === cardObj.suit);
    if (isWinCard) cardElements[index].classList.add("win-card");
  });
}

function clearHighlight() { 
  document.querySelectorAll("#payoutTable li").forEach(li => li.classList.remove("highlight")); 
  document.querySelectorAll("#cards .card").forEach(c => c.classList.remove("win-card"));
}

function endMini() {
  phase = "idle";
  document.getElementById("miniGame").style.display = "none";
  document.getElementById("gameArea").style.display = "block";
  document.getElementById("gameArea").scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("exchangeBtn").style.display = "none";
  clearHighlight();
  document.getElementById("bet").disabled = false;
  miniValue = 0;
  updateMoney();
  document.getElementById("result").innerText = "";
}

function formatBetText(num) {
  const tUnit = translations[currentLang].units;
  if (currentLang === 'en') {
    if (num >= 1e12) return Number((num / 1e12).toFixed(1)) + tUnit.tr;
    if (num >= 1e9) return Number((num / 1e9).toFixed(1)) + tUnit.bill;
    if (num >= 1e6) return Number((num / 1e6).toFixed(1)) + tUnit.mil;
    if (num >= 1e3) return Number((num / 1e3).toFixed(1)) + tUnit.k;
    return num.toLocaleString();
  }
  if (num >= 1e12) return Number((num / 1e12).toFixed(1)) + tUnit.tr;
  if (num >= 1e8) return Number((num / 1e8).toFixed(1)) + tUnit.bill;
  if (num >= 1e4) return Number((num / 1e4).toFixed(1)) + tUnit.man;
  return num.toLocaleString();
}

document.addEventListener("DOMContentLoaded", () => {
  const betSelect = document.getElementById("bet");
  for (let amt = 10; amt <= 1000000000000000; amt *= 10) {
    const opt = document.createElement("option");
    opt.value = amt;
    opt.innerText = formatBetText(amt);
    betSelect.appendChild(opt);
  }
  betSelect.value = 10; 
  
  if (localStorage.getItem('poker-dark-theme') === 'true') {
    document.body.classList.add('dark-theme');
    const themeToggle = document.getElementById('themeToggle');
    if(themeToggle) themeToggle.innerText = "☀️";
  }
  changeLanguage('ko'); 
  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("exchangeBtn").onclick = exchange;

  const howToBtn = document.getElementById("howToPlayBtn");
  if (howToBtn) {
    howToBtn.onclick = () => {
      const ui = document.getElementById("howToUI");
      const title = document.getElementById("howToTitle");
      const content = document.getElementById("howToContent");
      const closeBtn = document.getElementById("howToCloseBtn");
      const messages = {
  ko: { 
    title: "✨ 포커 게임 가이드 ✨", 
    body: "<b>[ 기본 룰 ]</b><br>" +
          "1️⃣ <b>베팅 & 시작:</b> 금액 선택 후 START!<br>" +
          "2️⃣ <b>홀드:</b> 남기고 싶은 카드를 터치하세요.<br>" +
          "3️⃣ <b>교환:</b> DRAW 버튼으로 새 카드를 받습니다.<br><br>" +
          "<b>[ 특별 보너스 ]</b><br>" +
          "🃏 <b>조커:</b> 어떤 카드든 변신하는 만능 카드!<br>" +
          "🔥 <b>피버 타임:</b> 10판마다 조커 등장 확률 UP!<br>" +
          "💰 <b>더블업:</b> 승리 시 하이&로우에 도전하세요!", 
    close: "행운을 빌어요! 🍀" 
  },
  en: { 
    title: "✨ Game Guide ✨", 
    body: "<b>[ Basic Rules ]</b><br>" +
          "1️⃣ <b>Bet & Start:</b> Choose bet and hit START!<br>" +
          "2️⃣ <b>Hold:</b> Tap cards you want to keep.<br>" +
          "3️⃣ <b>Draw:</b> Hit DRAW to replace other cards.<br><br>" +
          "<b>[ Special Features ]</b><br>" +
          "🃏 <b>Joker:</b> A wild card that fits anywhere!<br>" +
          "🔥 <b>Fever Time:</b> High Joker chance every 10th game!<br>" +
          "💰 <b>Double Up:</b> Win big with the High-Low game!", 
    close: "Good Luck! 🍀" 
  },
  ja: { 
    title: "✨ 遊び方ガイド ✨", 
    body: "<b>[ 基本ルール ]</b><br>" +
          "1️⃣ <b>ベット & スタート:</b> 額を選んでスタート！<br>" +
          "2️⃣ <b>ホールド:</b> 残したいカードをタップします。<br>" +
          "3️⃣ <b>交換:</b> DRAWで新しいカードを引きましょう。<br><br>" +
          "<b>[ 特別ボーナス ]</b><br>" +
          "🃏 <b>ジョーカー:</b> どのカードにもなれる万能カード！<br>" +
          "🔥 <b>フィーバータイム:</b> 10回ごとに確率アップ！<br>" +
          "💰 <b>ダブルアップ:</b> ハイ＆ローで配当倍増！", 
    close: "幸運を祈ります! 🍀" 
  }
};
      const data = messages[currentLang] || messages.ko;
      title.innerText = data.title;
      content.innerHTML = data.body.replace(/\n/g, '<br>');
      if (closeBtn) { closeBtn.innerText = data.close; closeBtn.onclick = () => ui.style.display = "none"; }
      ui.style.display = "block";
    };
  }

  setInterval(() => {
    if (typeof money !== 'undefined') { money += 500; updateMoney(); }
  }, 3600000);

// --- 설정창 요소 가져오기 ---
    const settingsBtn = document.getElementById("settingsOpenBtn");
    const settingsUI = document.getElementById("settingsUI");
    const settingsCloseBtn = document.getElementById("settingsCloseBtn");
    const themeToggle = document.getElementById("themeToggle"); // HTML의 🌙 버튼
    const volumeControl = document.getElementById("volumeControl"); // HTML의 슬라이더
    const volValueLabel = document.getElementById("volValue"); // % 표시 텍스트

// 🔥 여기 추가 !!!
if (volumeControl && volValueLabel) {
    const savedVolume = localStorage.getItem('poker-volume');

    if (savedVolume !== null) {
        globalVolume = Number(savedVolume);
    }

    volumeControl.value = globalVolume * 100;
    volValueLabel.innerText = Math.round(globalVolume * 100) + "%";

    // 🔊 초기 사운드에도 적용
    if (typeof rankSound !== 'undefined') {
        rankSound.volume = globalVolume;
    }
}

    // 1️⃣ 설정창 열기
    if (settingsBtn) {
        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            settingsUI.style.display = "block";
            
            // 열 때 현재 상태 반영
            if (themeToggle) themeToggle.innerText = isDarkMode ? "☀️" : "🌙";
            if (volumeControl) {
                volumeControl.value = globalVolume * 100;
                volValueLabel.innerText = Math.round(globalVolume * 100) + "%";
            }
        };
    }

    // 2️⃣ 설정창 닫기 (저장 및 닫기 버튼)
    if (settingsCloseBtn) {
        settingsCloseBtn.onclick = () => {
            settingsUI.style.display = "none";
        };
    }

   // 3️⃣ 🔥 다크 모드 토글 (🌙 버튼 클릭 시)
if (themeToggle) {
    themeToggle.onclick = () => {
        isDarkMode = !isDarkMode;
        
        if (isDarkMode) {
            document.body.classList.add('dark-theme'); // ✅ 수정
            themeToggle.innerText = "☀️";
        } else {
            document.body.classList.remove('dark-theme'); // ✅ 수정
            themeToggle.innerText = "🌙";
        }
        
        localStorage.setItem('poker-dark-theme', isDarkMode);
    };
}

    // 4️⃣ 🔊 볼륨 조절 슬라이더
    if (volumeControl) {
        volumeControl.oninput = (e) => {
            const val = e.target.value;
            globalVolume = val / 100;
            volValueLabel.innerText = val + "%";
            
            // 효과음 볼륨 즉시 반영 (rankSound가 선언되어 있다면)
            if (typeof rankSound !== 'undefined') rankSound.volume = globalVolume;
            
            localStorage.setItem('poker-volume', globalVolume);
        };
    }

    // 바깥 클릭 시 설정창 닫기
    window.onclick = (e) => {
        if (e.target === settingsUI) settingsUI.style.display = "none";
    };
});
