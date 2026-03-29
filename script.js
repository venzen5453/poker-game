/* =================== ⚙️ 기본 변수 설정 =================== */
let deck = [], hand = [], selected = [];

// 💾 1. 로컬 스토리지에서 저장된 돈 불러오기 (없으면 3,000원 시작)
let money = parseInt(localStorage.getItem('poker-money')) || 3000; 

// 🔊 [추가] 전역 볼륨 변수 (기본값 0.5)
let globalVolume = 0.5;

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
  // 🔴 고정값 대신 전역 볼륨 적용 (0.3 비율을 유지하고 싶다면 globalVolume * 0.6)
  s.volume = globalVolume * 0.6; 
  s.play();
}

function playSound(src, vol = 0.5) {
  const s = new Audio(src);
  // 🔴 설정된 전역 볼륨 적용
  s.volume = globalVolume; 
  s.play();
}

/* 🌐 다언어 데이터 */
const translations = {
  ko: { 
    title: "포커 게임", money: "자산", bet: "베팅액", start: "시작", exchange: "교환", payout: "배당표", 
    high: "높음", low: "낮음", cashout: "그만하기", double: "더블 찬스", win: "성공!", lose: "패배", draw: "무승부",
    refill: "❓ 게임 방법",
    howTo: "게임 방법", // 추가
    bonusInfo: "(1시간마다 500포인트 자동 지급)",
    options: "옵션",
    langLabel: "언어 설정 (Language)",
    themeLabel: "테마 설정 (Dark/Light)",
    volLabel: "소리 크기 (Volume)",
    saveClose: "저장 및 닫기",
    miniQuery: "축하합니다!\n미니게임에 도전하시겠습니까?\n승리시 2배",
    miniWin: "승리! 금액이 2배가 되었습니다.\n한 번 더 도전하시겠습니까?",
    accept: "수락",
    reject: "거절",
    
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
    refill: "❓ How to Play",
    howTo: "How to Play", // 추가
    bonusInfo: "(Get 500 points every hour)",
    options: "Settings",
    langLabel: "Language Settings",
    themeLabel: "Theme (Dark/Light)",
    volLabel: "Volume",
    saveClose: "Save & Close",
    miniQuery: "Congratulations!\nWould you like to play the mini-game?\n2x upon victory",
    miniWin: "Win! Your prize has doubled.\nTry again?",
    accept: "Accept",
    reject: "Decline",

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
    high: "高い", low: "低い", cashout: "終了", double: "ダブルチャンス", win: "成功！", lose: "敗北", draw: "引き分け",
    refill: "❓ 遊び方",
    howTo: "遊び方", // 추가
    bonusInfo: "(1시간마다 500포인트 자동 지급)",
    options: "オプション",
    langLabel: "言語設定 (Language)",
    themeLabel: "テーマ設定 (Dark/Light)",
    volLabel: "音量 (Volume)",
    saveClose: "保存して閉じる",
    miniQuery: "おめでとうございます！\nミニゲームに挑戦しますか？\n勝利時２倍",
    miniWin: "勝利！賞金が2배になりました。\nもう一度挑戦しますか？",
    accept: "受諾",
    reject: "拒否",

    ranks: {
      "파이브 카드": "ファイ브카드",
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
  if (v === "JOKER") return 15;
  if (v === "A" || v === 1 || v === "1") return 14; 
  if (v === "K" || v === 13 || v === "13") return 13;
  if (v === "Q" || v === 12 || v === "12") return 12;
  if (v === "J" || v === 11 || v === "11") return 11;
  
  // 숫자인 경우 바로 반환, 문자열인 경우 숫자로 변환
  const num = parseInt(v);
  return isNaN(num) ? 0 : num; 
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
  
  // 1. 설정창 및 상단 옵션 텍스트 변경
  if (document.getElementById('ui-options-text')) 
      document.getElementById('ui-options-text').innerText = t.options;
  
  if (document.getElementById('ui-settings-title')) 
      document.getElementById('ui-settings-title').innerText = "⚙️ " + t.options;

  // 🔴 요청하신 3종 세트 (언어, 테마, 소리)
  if (document.getElementById('ui-lang-label')) 
      document.getElementById('ui-lang-label').innerText = t.langLabel;
  
  if (document.getElementById('ui-theme-label')) 
      document.getElementById('ui-theme-label').innerText = t.themeLabel;
  
  if (document.getElementById('ui-vol-label')) 
      document.getElementById('ui-vol-label').innerText = t.volLabel;

  // 저장 버튼
  if (document.getElementById('settingsCloseBtn')) 
      document.getElementById('settingsCloseBtn').innerText = t.saveClose;

  // 2. 기본 게임 텍스트 변경
  document.getElementById('ui-title').innerText = t.title;
  document.getElementById('ui-money-label').innerText = t.money;
  document.getElementById('ui-bet-label').innerText = t.bet + ":";
  document.getElementById('startBtn').innerText = t.start;
  document.getElementById('exchangeBtn').innerText = t.exchange;
  document.getElementById('ui-payout-title').innerText = t.payout;
  document.getElementById('ui-mini-title').innerText = t.double;
  document.getElementById('ui-high-btn').innerText = t.high;
  document.getElementById('ui-low-btn').innerText = t.low;

  // 그만하기 버튼 처리 (존재할 경우에만)
  const cashoutBtn = document.getElementById('ui-cashout-btn');
  if (cashoutBtn) cashoutBtn.innerText = t.cashout;

  // 3. 🔴 [Confirm UI] 실시간 번역
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


  // 3. 게임 방법 버튼 및 보너스 문구 변경
  const howToSpan = document.getElementById('ui-refill-text') || document.getElementById('ui-how-to-text');
  if (howToSpan) howToSpan.innerText = t.refill; 

  const bonusInfoP = document.getElementById('ui-bonus-info');
  if (bonusInfoP) bonusInfoP.innerText = t.bonusInfo;

  // 4. 배당표 재생성
  const payoutList = document.getElementById("payoutTable");
  if (payoutList) {
    payoutList.innerHTML = "";
    Object.keys(payout).forEach(rankName => {
      if (rankName === "노페어") return;
      const li = document.createElement("li");
      li.id = rankName;
      li.innerHTML = `<span>${t.ranks[rankName]}</span> <span>${payout[rankName]}${t.unit}</span>`;
      payoutList.appendChild(li);
    });
  }
}

function render() {
  const container = document.getElementById("cards");
  if (!container) return; 
  
  container.innerHTML = "";
  
  // 1. 족보 계산 및 결과 텍스트 업데이트 (여기서 한글로 결정됨)
  const resultText = checkHand(hand); 
  const resultElement = document.getElementById("result");
  if (resultElement) {
    resultElement.innerText = resultText; // "원페어 (A)" 등으로 표시
  }

  hand.forEach((card, i) => {
    const wrap = document.createElement("div");
    wrap.className = "card";
    
    const isJoker = (card.value === "JOKER" || card.rank === "JOKER");
    if (isJoker) wrap.classList.add("joker-card");

    // 🏆 [핵심 수정] 객체 비교(includes) 대신 값 비교(some) 사용
    if (window.winCards && window.winCards.length > 0) {
      const isWin = window.winCards.some(wc => 
        wc.value === card.value && wc.suit === card.suit
      );
      if (isWin) wrap.classList.add("win-card");
    }

    const inner = document.createElement("div");
    inner.className = "inner flip"; 
    
    const front = document.createElement("div");
    front.className = "front";
    
    if (isJoker) {
      front.innerHTML = `<img src="jokerimg.png" class="joker-img"><span class="joker-text">JOKER</span>`;
    } else {
      // 값과 문양 표시
      front.innerText = (card.value || card.rank) + card.suit;
    }
    
    if (typeof setCardColor === 'function') {
      setCardColor(front, card.suit, (card.value || card.rank));
    }
    
    const back = document.createElement("div");
    back.className = "back";

    inner.appendChild(front);
    inner.appendChild(back);
    wrap.appendChild(inner);

    wrap.onclick = () => { 
      if (typeof phase !== 'undefined' && phase === "draw") {
        toggleHold(i, wrap); 
      }
    };

    container.appendChild(wrap);

    setTimeout(() => {
      inner.classList.remove("flip");
      if (typeof playFlip === 'function') playFlip();
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
  const betValue = parseInt(document.getElementById("bet").value);
  const win = payout[rank] * betValue;
  const t = translations[currentLang]; 
  
  highlightRank(rank);
  highlightCards();

  const resultEl = document.getElementById("result"); // 결과 엘리먼트 참조

  if (win > 0) {
    rankSound.play();
    
    resultEl.innerText = `${t.ranks[rank]} (${win.toLocaleString()}) - ${payout[rank]}${t.unit}`;

    // ✅ [추가] 결과가 나오면 결과창 위치로 부드럽게 스크롤
    // 'center'로 맞추면 결과창과 그 아래 뜰 팝업창이 화면 중앙에 오게 됩니다.
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (payout[rank] >= 1) {
      miniValue = win; 
      setTimeout(() => {
        showCustomConfirm(
          t.miniQuery, 
          () => startMiniGame(), 
          () => { 
            money += win; 
            updateMoney(); 
            resetUI(); 
            // ✅ [추가] 정산 후 다시 상단(카드 영역)으로 스크롤 이동
            document.getElementById("cards").scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        );
      }, 1000);
    } else {
      money += win;
      updateMoney();
      setTimeout(() => {
        resetUI();
        // 0.5배 정산 후 다시 위로 이동
        document.getElementById("cards").scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 1500);
    }
  } else {
    resultEl.innerText = t.ranks[rank];
    // ✅ [추가] 패배 시에도 결과를 보여주기 위해 살짝 스크롤
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

/* 🎰 미니게임 (하이로우) */
function startMiniGame() {
  phase = "mini";
  miniLock = false;
  
  const miniGameArea = document.getElementById("miniGame");
  const gameArea = document.getElementById("gameArea");

  // 1. 본게임 숨기고 미니게임 표시
  miniGameArea.style.display = "block";
  gameArea.style.display = "none";

  // 2. 🔴 [핵심 수정] 0.05초 뒤에 스크롤 실행
  // 브라우저가 요소를 렌더링할 시간을 주어 위치 계산 오류를 방지합니다.
  setTimeout(() => {
    miniGameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);

  // 3. 초기 카드 설정
  baseCard = getRandomValue();
  setMiniCard("rightCard", baseCard, true);
  setMiniCard("leftCard", 0, false);

  // 4. 현재 금액 표시 (번역 적용)
  const t = translations[currentLang];
  document.getElementById("miniResult").innerText = 
    t.money + ": " + miniValue.toLocaleString();
}

// 🔄 이 함수로 기존 guess를 교체하세요
function guess(type) {
  if (miniLock) return;
  miniLock = true; // 🔒 일단 잠금

  const newCard = getRandomValue();
  const leftInner = document.getElementById("leftCard").querySelector(".inner");
  const rightInner = document.getElementById("rightCard").querySelector(".inner");
  const resultText = document.getElementById("miniResult");
  const t = translations[currentLang]; // 🌐 현재 언어셋

  // 1. 왼쪽 카드(새 카드)를 오픈
  setMiniCard("leftCard", newCard, true);

  // 2. 카드 오픈 애니메이션 시간을 기다린 후 판정 (0.5초 뒤)
  setTimeout(() => {
    const newV = convertValue(newCard);
    const baseV = convertValue(baseCard);

    // [무승부 판정]
    if (newCard === baseCard) {
      resultText.innerText = t.draw;
      setTimeout(() => {
        leftInner.classList.add("flip");
        rightInner.classList.add("flip");
        setTimeout(() => {
          baseCard = getRandomValue();
          setMiniCard("rightCard", baseCard, true);
          setMiniCard("leftCard", 0, false);
          miniLock = false; // 🔓 잠금 해제
        }, 600);
      }, 800);
      return;
    }

    // [승리 판정]
    if ((type === "high" && newV > baseV) || (type === "low" && newV < baseV)) {
      miniValue *= 2;
      playSound(winSoundSrc);
      resultText.innerText = t.win + " " + miniValue.toLocaleString();

      setTimeout(() => {
        // ✅ [번역 수정] 고정된 한글 대신 t.miniWin 사용
        showCustomConfirm(
          `${t.miniWin}\n(${t.money}: ${miniValue.toLocaleString()})`, 
          () => {
            // ✅ 수락 시 로직
            leftInner.classList.add("flip"); 
            
            setTimeout(() => {
              baseCard = newCard;
              setMiniCard("rightCard", baseCard, true); 
              setMiniCard("leftCard", 0, false); 
              
              miniLock = false; 
              // ✅ [번역 수정] t.money 활용
              resultText.innerText = t.money + ": " + miniValue.toLocaleString();
            }, 600);
          },
          () => {
            // ✅ 거절 시 로직
            money += miniValue;
            updateMoney();
            endMini();
          }
        );
      }, 1000);

    // [패배 판정]
    } else {
      playSound(loseSoundSrc);
      resultText.innerText = t.lose;
      miniValue = 0;
      setTimeout(() => {
        endMini(); 
      }, 2000);
    }
  }, 500);
}

function showCustomConfirm(message, onAccept, onReject) {
  const ui = document.getElementById("miniConfirmUI");
  const msgEl = document.getElementById("confirmMsg");
  const accBtn = document.getElementById("acceptBtn");
  const rejBtn = document.getElementById("rejectBtn");

  if (!ui) return;

  // 🌐 현재 언어 설정에 맞는 텍스트 가져오기
  const t = translations[currentLang];

  // 1. 메시지와 버튼 텍스트 설정
  msgEl.innerText = message;
  accBtn.innerText = t.accept; // translations 객체에 정의한 'accept' 사용
  rejBtn.innerText = t.reject; // translations 객체에 정의한 'reject' 사용

  ui.style.display = "block";

  // 2. 이벤트 리스너 초기화 (중복 방지)
  accBtn.onclick = null;
  rejBtn.onclick = null;

  // 3. 수락 버튼 클릭 시
  accBtn.onclick = () => {
    ui.style.display = "none"; 
    if (typeof onAccept === "function") onAccept(); 
  };
  
  // 4. 거절 버튼 클릭 시
  rejBtn.onclick = () => {
    ui.style.display = "none"; 
    if (typeof onReject === "function") onReject(); 
  };
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

function checkHand(hand) {
  // 1. 초기값 설정 (절대 undefined가 리턴되지 않게 함)
  let resultText = "노페어";
  window.winCards = []; 

  if (!hand || hand.length === 0) return "노페어";

  const jokerCount = hand.filter(c => c.value === "JOKER").length;
  const normalCards = hand.filter(c => c.value !== "JOKER");
  const map = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };

  const vals = normalCards.map(c => map[c.value] || parseInt(c.value)).sort((a, b) => a - b);
  const counts = {};
  vals.forEach(v => counts[v] = (counts[v] || 0) + 1);
  
  const countEntries = Object.entries(counts).sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]));
  const countArr = countEntries.map(e => e[1]);

  const isFlush = normalCards.length > 5 ? false : (normalCards.length > 0 && new Set(normalCards.map(c => c.suit)).size === 1);
  const uniqueVals = [...new Set(vals)];
  let isStraight = false;

  if (jokerCount === 0) {
    isStraight = (uniqueVals.length === 5 && (vals[4] - vals[0] === 4)) || JSON.stringify(vals) === "[2,3,4,5,14]";
  } else if (uniqueVals.length === 4) {
    isStraight = (vals[3] - vals[0] <= 4) || [[2,3,4,14], [2,3,5,14], [2,4,5,14], [3,4,5,14]].some(arr => JSON.stringify(uniqueVals) === JSON.stringify(arr));
  }

  // 🏆 족보 판정 시작
  if (jokerCount > 0 && (countArr[0] || 0) === 4) { 
    window.winCards = [...hand]; resultText = "파이브 카드"; 
  } else if (isStraight && isFlush) { 
    window.winCards = [...hand]; resultText = (vals.includes(14) || jokerCount > 0) ? "로얄 스트레이트 플러시" : "스트레이트 플러시"; 
  } else if ((countArr[0] || 0) + jokerCount >= 4) {
    const targetVal = countEntries[0][0];
    window.winCards = hand.filter(c => (map[c.value] || parseInt(c.value)) == targetVal || c.value === "JOKER");
    resultText = "포카드";
  } else if ((countArr[0] === 3 && countArr[1] === 2) || (jokerCount === 1 && countArr[0] === 2 && countArr[1] === 2)) {
    window.winCards = [...hand]; resultText = "풀하우스";
  } else if (isFlush) { 
    window.winCards = [...hand]; resultText = "플러시"; 
  } else if (isStraight) { 
    window.winCards = [...hand]; resultText = "스트레이트"; 
  } else if ((countArr[0] || 0) + jokerCount >= 3) {
    const targetVal = countEntries[0][0];
    window.winCards = hand.filter(c => (map[c.value] || parseInt(c.value)) == targetVal || c.value === "JOKER");
    resultText = "트리플";
  } else if (countArr.filter(v => v === 2).length === 2) {
    const pairVals = countEntries.filter(e => e[1] === 2).map(e => e[0]);
    window.winCards = hand.filter(c => pairVals.includes(String(map[c.value] || c.value)));
    resultText = "투페어";
  // ... (앞부분 생략)
  } else if (jokerCount >= 1 || (countArr[0] && countArr[0] >= 2)) {
    // 🔥 원페어 판정 구간 수정
    let jokerCard = hand.find(c => c.value === "JOKER");
    
    if (jokerCount > 0 && jokerCard) {
      // 조커가 포함된 원페어일 때
      const sortedNormal = [...normalCards].sort((a, b) => (map[b.value] || parseInt(b.value)) - (map[a.value] || parseInt(a.value)));
      const highest = sortedNormal[0];
      const matchCard = hand.find(c => c.value === highest.value && c.suit === highest.suit && c !== jokerCard);
      window.winCards = [jokerCard, matchCard || hand.find(c => c.value === highest.value)];
      
      // 🎯 (A)를 빼고 "원페어"만 입력
      resultText = "원페어"; 
    } else if (countArr[0] >= 2) {
      // 일반 원페어일 때
      const targetVal = countEntries[0][0]; 
      window.winCards = hand.filter(c => (map[c.value] || parseInt(c.value)) == targetVal);
      
      // 🎯 여기도 "원페어"만 입력
      resultText = "원페어"; 
    }
  }

  // 🏁 마지막에 반환
  if (typeof highlightRank === 'function') highlightRank(resultText);
  return resultText; 
}



function highlightRank(rank) {
  // 추가: rank가 문자열이 아니면(undefined 등) 바로 중단
  if (typeof rank !== "string") return; 

  document.querySelectorAll("#payoutTable li").forEach(li => {
    li.classList.remove("highlight");
  });

  if (!rank || rank === "노페어") return;

  let searchId = rank.split(" ")[0];

  if (rank.includes("로얄")) searchId = "로얄 스트레이트 플러시";
  if (rank.includes("스트레이트 플러시") && !rank.includes("로얄")) searchId = "스트레이트 플러시";

  const el = document.getElementById(searchId);
  if (el) {
    el.classList.add("highlight");
  }
}

function highlightCards() {
  // 1. 기존 테두리 초기화
  const cardElements = document.querySelectorAll("#cards .card");
  cardElements.forEach(card => card.classList.remove("win-card"));

  // 2. checkHand에서 저장한 winCards가 비어있지 않은지 확인
  if (!winCards || winCards.length === 0) return;

  // 3. 현재 화면의 카드(hand)와 당첨 카드(winCards)를 비교하여 테두리 추가
  hand.forEach((cardObj, index) => {
    // winCards 배열 안에 현재 카드 객체가 포함되어 있는지 확인
    const isWinCard = winCards.some(winObj => 
      winObj.value === cardObj.value && winObj.suit === cardObj.suit
    );

    if (isWinCard) {
      cardElements[index].classList.add("win-card");
    }
  });
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
  
  const miniGameArea = document.getElementById("miniGame");
  const gameArea = document.getElementById("gameArea");

  // 1. 미니게임 숨기고 본게임 표시
  miniGameArea.style.display = "none";
  gameArea.style.display = "block";

  // ✅ [추가] 본게임 영역(카드판) 시작 지점으로 화면을 부드럽게 올립니다.
  // block: 'start'를 사용하면 상단 타이틀이나 카드 부분이 화면 맨 위로 오게 됩니다.
  gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 2. UI 버튼 및 상태 초기화
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("exchangeBtn").style.display = "none";
  
  clearHighlight();
  document.getElementById("bet").disabled = false;
  
  // 3. 미니게임 금액 초기화 및 자산 업데이트
  miniValue = 0;
  updateMoney();

  // 4. 결과 텍스트 초기화 (다음 판을 위해 깔끔하게 비움)
  document.getElementById("result").innerText = "";
  document.getElementById("miniResult").innerText = "";
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-theme');
  document.getElementById('themeToggle').innerText = isDark ? "☀️" : "🌙";
  localStorage.setItem('poker-darkmode', isDark);
}

document.addEventListener("DOMContentLoaded", () => {
  const betSelect = document.getElementById("bet");

  // 💰 숫자를 '조', '억', '만' 단위로 변환하는 함수
  function formatBetText(num) {
    if (num >= 1000000000000) return (num / 1000000000000) + "조";
    if (num >= 100000000) return (num / 100000000) + "억";
    if (num >= 10000) return (num / 10000) + "만";
    return num.toLocaleString();
  }

  for (let amt = 10; amt <= 1000000000000000; amt *= 10) {
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
  const howToBtn = document.getElementById("howToPlayBtn");

  // 1. 클릭 시 커스텀 게임 방법 안내창 표시
  if (howToBtn) {
    howToBtn.onclick = () => {
      // 커스텀 UI 엘리먼트 가져오기
      const ui = document.getElementById("howToUI");
      const title = document.getElementById("howToTitle");
      const content = document.getElementById("howToContent");
      const closeBtn = document.getElementById("howToCloseBtn");

      // 현재 선택된 언어 가져오기 (전역변수 currentLang 사용 권장)
      const lang = (typeof currentLang !== 'undefined') ? currentLang : (document.getElementById('langSelect').value || 'ko');

      // 상세 안내 데이터
      const messages = {
        ko: {
          title: "🃏 [ 포커 게임 방법 ]",
          body: "1. 베팅 금액 설정 후 [시작] 클릭\n2. 바꾸지 않을 카드를 선택(HOLD). 선택되지 않은 카드는 교체됩니다.\n3. [교환]을 클릭하여 카드 교체\n4. 족보 완성 시 당첨금 지급!\n\n💰 [더블 찬스]\n승리 시 도전! 다음 카드가 더 클지 작을지 맞춰보세요.",
          close: "닫기"
        },
        en: {
          title: "🃏 [ How to Play ]",
          body: "1. Set your bet and click [Start].\n2. Select the cards you want to keep (HOLD). Unselected cards will be replaced.\n3. Click [Draw] to exchange cards.\n4. Get paid if you have a winning hand!\n\n💰 [Double Chance]\nChallenge after a win! Guess if the next card will be higher or lower.",
          close: "Close"
        },
        ja: {
          title: "🃏 [ 遊び方 ]",
          body: "1. ベット額を設定して [スタート] をクリック。\n2. 残したいカードを選択 (HOLD)。選択されていないカードが交換されます。\n3. [交換] をクリックしてカードを交換。\n4. 役が完成すれば配当獲得！\n\n💰 [ダブルチャンス]\n勝利時に挑戦！次のカードがより大きいか小さいか当ててみてください。",
          close: "閉じる"
        }
      };

      const data = messages[lang] || messages.ko;

      // 텍스트 반영 (\n을 <br>로 치환하여 줄바꿈 적용)
      title.innerText = data.title;
      content.innerHTML = data.body.replace(/\n/g, '<br>');
      if (closeBtn) closeBtn.innerText = data.close;

      // 팝업 표시
      ui.style.display = "block";

      // 닫기 버튼 기능
      if (closeBtn) {
        closeBtn.onclick = () => { ui.style.display = "none"; };
      }
    };
  }

  // 2. 1시간(3600초)마다 500원 자동 충전
  setInterval(() => {
    // 전역 money 변수가 선언되어 있어야 함
    if (typeof money !== 'undefined') {
      money += 500;
      if (typeof updateMoney === 'function') updateMoney();
      console.log("🎁 Hourly bonus 500 added.");
    }
  }, 3600 * 1000); 
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

/* =================== ⚙️ 설정창 및 시스템 제어 =================== */
document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settingsOpenBtn");
  const settingsUI = document.getElementById("settingsUI");
  const settingsCloseBtn = document.getElementById("settingsCloseBtn");
  const volumeControl = document.getElementById("volumeControl");
  const volValueDisplay = document.getElementById("volValue");
  const themeToggle = document.getElementById("themeToggle");
  const langSelect = document.getElementById("langSelect");

  // 1. 설정창 열기
  settingsBtn.onclick = (e) => {
    e.stopPropagation();
    settingsUI.style.display = "block";
  };

  // 2. 저장 및 닫기 버튼 (X 버튼)
  settingsCloseBtn.onclick = (e) => {
    e.stopPropagation();
    settingsUI.style.display = "none";
  };

  // 3. 🔥 [핵심] 배경(바닥)을 눌렀을 때만 닫기 판정
  settingsUI.onclick = (e) => {
    // e.target은 실제로 클릭된 요소입니다.
    // 클릭된 녀석이 settingsUI(배경 레이어) 본체일 때만 창을 닫습니다.
    if (e.target === settingsUI) {
      settingsUI.style.display = "none";
    }
  };

  // 4. 내부 요소들(슬라이더, 버튼 등) 클릭 시 배경으로 신호 안 가게 막기
  // 이렇게 하면 박스 안의 글자나 여백을 눌러도 배경 클릭으로 인식되지 않습니다.
  [langSelect, themeToggle, volumeControl].forEach(el => {
    if (el) {
      el.onclick = (e) => e.stopPropagation();
    }
  });

  // 5. 다크모드 버튼 기능 (별도 함수 호출 대신 여기서 직접 처리)
  if (themeToggle) {
    themeToggle.onclick = (e) => {
      e.stopPropagation(); // 닫힘 방지
      const isDark = document.body.classList.toggle('dark-theme');
      themeToggle.innerText = isDark ? "☀️" : "🌙";
      localStorage.setItem('poker-darkmode', isDark);
    };
  }

  // 6. 볼륨 조절 슬라이더
  volumeControl.oninput = (e) => {
    e.stopPropagation();
    const val = e.target.value;
    volValueDisplay.innerText = val + "%";
    globalVolume = val / 100;
    if (typeof rankSound !== 'undefined') rankSound.volume = globalVolume;
  };

  // 초기 상태 로드
  if (localStorage.getItem('poker-darkmode') === 'true') {
    document.body.classList.add('dark-theme');
    if(themeToggle) themeToggle.innerText = "☀️";
  }
  
  // 기타 게임 초기화
  updateMoney();
  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("exchangeBtn").onclick = exchange;
});