let deck=[], hand=[], selected=[], money=1000;
let phase="idle";

let miniValue=0;
let baseCard=0;
let miniLock=false; // 🔥 중복 클릭 방지

/* 🔊 효과음 */
const flipSoundSrc = "https://assets.mixkit.co/active_storage/sfx/1116/1116-preview.mp3";
const winSoundSrc = "https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3";
const loseSoundSrc = "https://assets.mixkit.co/active_storage/sfx/2043/2043-preview.mp3";
const rankSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");

winSoundSrc.volume=0.5;
loseSoundSrc.volume=0.5;
rankSound.volume=0.5;

/* 🔥 사운드 (겹침 방지) */
function playSound(src, vol=0.5, duration=1000){
  const s = new Audio(src);
  s.volume = vol;
  s.play();
  setTimeout(()=>{ s.pause(); s.currentTime = 0; }, duration);
}

function playFlip(){
  const s = new Audio(flipSoundSrc);
  s.volume = 0.35;
  s.playbackRate = 0.9 + Math.random()*0.2;
  s.play();
  setTimeout(()=>{ s.pause(); },120);
}

/* 카드 */
const suits=["♠","♥","♦","♣"];
const values=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

/* 값 변환 (A=14) */
function convertValue(v){ return v===1?14:v; }

function createDeck(){
  deck=[];
  for(let s of suits){
    for(let v of values){
      deck.push({suit:s,value:v});
    }
  }
}

function shuffle(){ deck.sort(()=>Math.random()-0.5); }
function deal(){ return deck.splice(0,5); }
function drawOne(){ return deck.shift(); }

/* 색 */
function setCardColor(el, suit){
  el.classList.remove("red");
  if(suit==="♥" || suit==="♦") el.classList.add("red");
}

/* 렌더 */
function render(){
  const c=document.getElementById("cards");
  c.innerHTML="";
  let inners=[];

  hand.forEach((card,i)=>{
    const wrap=document.createElement("div");
    wrap.className="card";

    const inner=document.createElement("div");
    inner.className="inner flip";

    const front=document.createElement("div");
    front.className="front";
    front.innerText=card.value+card.suit;
    setCardColor(front, card.suit);

    const back=document.createElement("div");
    back.className="back";

    inner.appendChild(front);
    inner.appendChild(back);
    wrap.appendChild(inner);

    wrap.onclick=()=>{
      if(phase!=="draw") return;
      toggle(i, wrap);
    };

    c.appendChild(wrap);
    inners.push(inner);
  });

  setTimeout(()=>{
    inners.forEach((inner,i)=>{
      setTimeout(()=>{
        playFlip();
        inner.classList.remove("flip");
      },i*120);
    });
  },300);
}

function toggle(i, el){
  if(selected.includes(i)){
    selected=selected.filter(x=>x!==i);
    el.classList.remove("selected");
  } else {
    selected.push(i);
    el.classList.add("selected");
  }
}

/* 시작 */
function startGame(){
  if(phase==="mini") return;
  const bet=+document.getElementById("bet").value;
  if(money<bet){ alert("돈 부족"); return; }

  money -= bet;
  updateMoney();

  createDeck(); shuffle();
  hand = deal();
  selected=[];
  phase="draw";

  render();
  clearHighlight();

  document.getElementById("startBtn").style.display="none";
  document.getElementById("exchangeBtn").style.display="inline-block";
  document.getElementById("result").innerText="";
}

/* 교환 */
function exchange(){
  if(phase!=="draw") return;
  const cards=document.querySelectorAll(".inner");
  selected.forEach(i=> cards[i].classList.add("flip"));

  setTimeout(()=>{
    selected.forEach(i=> hand[i]=drawOne());
    selected.forEach(i=>{
      const inner=cards[i];
      const front=inner.querySelector(".front");
      front.innerText = hand[i].value+hand[i].suit;
      setCardColor(front, hand[i].suit);
      playFlip();
      inner.classList.remove("flip");
    });
    selected=[];
    document.querySelectorAll(".card").forEach(c=>c.classList.remove("selected"));

    setTimeout(()=>{
      const rank = checkHand(hand);
      const bet = +document.getElementById("bet").value;
      const win = payout[rank]*bet;

      highlightRank(rank);
      highlightCards();

      if(rank!=="노페어"){ rankSound.currentTime=0; rankSound.play(); }

        if(rank==="원페어"){
        const win = payout[rank] * bet;  // bet = 현재 베팅 금액
        animateMoney(money + win);
        document.getElementById("result").innerText = "원페어 +" + win;
      }
      else if(rank!=="노페어"){
        miniValue = win;
        document.getElementById("result").innerText = rank+" ("+win+")";
        setTimeout(()=> startMiniGame(),1200);
      } else {
        document.getElementById("result").innerText="패배";
      }

      document.getElementById("exchangeBtn").style.display="none";
      document.getElementById("startBtn").style.display="inline-block";
    },600);

  },500);
}

/* 💰 돈 애니메이션 */
function animateMoney(target){
  let start=money;
  let diff=target-start;
  let step=0;
  const interval=setInterval(()=>{
    step++;
    money = Math.floor(start + diff*(step/20));
    updateMoney();
    if(step>=20){ money=target; updateMoney(); clearInterval(interval); }
  },30);
}

/* 🎰 미니게임 시작 */
function startMiniGame(){
  phase="mini";
  miniLock=false;

  document.getElementById("miniGame").style.display="block";

  baseCard = getRandomValue();

  setMiniCard("rightCard", baseCard, true);
  setMiniCard("leftCard", 0, false);

  document.getElementById("miniResult").innerText="배팅: "+miniValue;
}

/* 플레이어 선택 */
function guess(type){
  if(miniLock) return;
  miniLock=true;

  const newCard = getRandomValue();
  setMiniCard("leftCard", 0, false);

  setTimeout(()=>{
    setMiniCard("leftCard", newCard, true);

    setTimeout(()=>{
      const newV = convertValue(newCard);
      const baseV = convertValue(baseCard);

      // 무승부
      if(newCard === baseCard){
        document.getElementById("miniResult").innerText="무승부!";
        setTimeout(()=>{
          // 새 카드로 재시작
          baseCard = getRandomValue();
          setMiniCard("leftCard", 0, false);
          setMiniCard("rightCard", 0, false);
          setTimeout(()=>{
            setMiniCard("rightCard", baseCard, true);
            miniLock=false;
          }, 200);
        }, 600);
        return;
      }

      // 승리
      if((type==="high" && newV > baseV) || (type==="low" && newV < baseV)){
        miniValue *= 2;
        playSound(winSoundSrc);
        document.getElementById("miniResult").innerText="성공! "+miniValue;

        setTimeout(()=>{
          baseCard = getRandomValue();
          setMiniCard("leftCard", 0, false);
          setMiniCard("rightCard", 0, false);
          setTimeout(()=>{
            setMiniCard("rightCard", baseCard, true);
            miniLock=false;
          },300);
        },800);
      } else {
        // 패배
        playSound(loseSoundSrc);
        document.getElementById("miniResult").innerText="실패!";
        miniValue = 0;
        setTimeout(()=> endMini(), 1000);
      }

    },400);

  },300);
}

/* 💳 미니카드 표시 */
function setMiniCard(id,val,open){
  const el=document.getElementById(id).querySelector(".inner");
  const front=el.querySelector(".front");
  if(val!==0){
    const display=getCardDisplay(val);
    front.innerText = display.text;
    setCardColor(front, display.suit);
  }
  if(open){ playFlip(); el.classList.remove("flip"); }
  else el.classList.add("flip");
}

function getCardDisplay(val){
  const map={1:"A",11:"J",12:"Q",13:"K"};
  const display = map[val] || val;
  const suit = suits[Math.floor(Math.random()*4)];
  return {text:display+suit,suit};
}

function getRandomValue(){ return Math.floor(Math.random()*13)+1; }

/* 족보 */
function checkHand(hand){
  const map={A:14,J:11,Q:12,K:13};
  const vals=hand.map(c=> map[c.value]||parseInt(c.value));
  const counts={};
  vals.forEach(v=> counts[v]=(counts[v]||0)+1);
  const arr=Object.values(counts);
  const flush = hand.every(c=> c.suit===hand[0].suit);
  const sorted=[...vals].sort((a,b)=>a-b);
  let straight=true;
  for(let i=1;i<sorted.length;i++) if(sorted[i]!==sorted[i-1]+1) straight=false;
  if(JSON.stringify(sorted)==="[2,3,4,5,14]") straight=true;
  if(straight && flush && Math.min(...vals)===10) return "로얄 스트레이트 플러시";
  if(straight && flush) return "스트레이트 플러시";
  if(arr.includes(4)) return "포카드";
  if(arr.includes(3)&&arr.includes(2)) return "풀하우스";
  if(flush) return "플러시";
  if(straight) return "스트레이트";
  if(arr.includes(3)) return "트리플";
  if(arr.filter(v=>v===2).length===2) return "투페어";
  if(arr.includes(2)) return "원페어";
  return "노페어";
}

const payout={
  "로얄 스트레이트 플러시":50,
  "스트레이트 플러시":30,
  "포카드":20,
  "풀하우스":10,
  "플러시":7,
  "스트레이트":5,
  "트리플":3,
  "투페어":2,
  "원페어":1,
  "노페어":0
};

function highlightRank(rank){
  document.querySelectorAll("#payoutTable li").forEach(li=> li.classList.remove("highlight"));
  const el=document.getElementById(rank);
  if(el) el.classList.add("highlight");
}

function highlightCards(){
  const cards=document.querySelectorAll(".card");
  cards.forEach(c=> c.classList.remove("win-card"));
  const map={};
  hand.forEach((c,i)=>{ map[c.value]=map[c.value]||[]; map[c.value].push(i); });
  Object.values(map).forEach(arr=>{ if(arr.length>=2) arr.forEach(i=> cards[i].classList.add("win-card")); });
}

function clearHighlight(){
  document.querySelectorAll("#payoutTable li").forEach(li=> li.classList.remove("highlight"));
}

function updateMoney(){
  document.getElementById("money").innerText=money;
}

/* 🔹 미니게임에서 그만하기 */
function cashOut(){
  if(phase !== "mini") return; // 미니게임 중이 아니면 무시

  if(miniValue > 0){
    money += miniValue; // 지금까지 딴 돈 합산
    updateMoney();
    miniValue = 0;
  }

  endMini(); // 미니게임 종료 및 본게임으로 돌아가기
}

/* 🔹 미니게임 종료 후 본게임 복귀 */
function endMini(){
  phase = "idle";
  miniLock = false;

  // 미니게임 화면 숨기기
  document.getElementById("miniGame").style.display = "none";

  // 시작/교환 버튼 초기화
  document.getElementById("startBtn").style.display = "inline-block";
  document.getElementById("exchangeBtn").style.display = "none";

  // 결과 초기화
  document.getElementById("miniResult").innerText = "";
  clearHighlight();

  // miniValue 초기화 (그만하기/패배 시)
  miniValue = 0;
}

document.addEventListener("DOMContentLoaded", ()=>{
  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("exchangeBtn").onclick = exchange;
});