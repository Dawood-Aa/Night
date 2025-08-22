// game.js - polished blackjack with hi-lo counting, reset button, high contrast card faces

// config
const START_BALANCE = 1000;
const SHOE_DECKS = 6;
const MIN_BET = 10;
const SHUFFLE_THRESHOLD_CARDS = 52; // if cards left below this, reshuffle

// dom
const dealerHandDiv = document.getElementById('dealer-hand');
const playerHandDiv = document.getElementById('player-hand');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const messageEl = document.getElementById('message');
const balanceEl = document.getElementById('balance');
const bestEl = document.getElementById('best-balance');
const betInput = document.getElementById('bet-input');
const maxBetBtn = document.getElementById('max-bet');

const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const doubleBtn = document.getElementById('double-btn');
const splitBtn = document.getElementById('split-btn');

const runningCountEl = document.getElementById('running-count');
const trueCountEl = document.getElementById('true-count');
const countHintEl = document.getElementById('count-hint');
const cardsLeftEl = document.getElementById('cards-left');
const decksLeftEl = document.getElementById('decks-left');

const resetBtn = document.getElementById('reset-btn');

// state
let deck = [];
let playerHand = [];
let dealerHand = [];
let balance = START_BALANCE;
let bestBalance = START_BALANCE;
let stake = 0;
let roundActive = false;
let firstAction = true;
let runningCount = 0; // hi-lo running count
let shoeCreated = false;

// helpers
function formatMoney(n) {
  // show integer without decimals when whole, else show 2 decimals
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2);
}

function createShoe(decks = SHOE_DECKS) {
  const suits = ['♠','♥','♦','♣'];
  const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const shoe = [];
  for (let d = 0; d < decks; d++) {
    for (let s of suits) {
      for (let v of values) shoe.push({ suit: s, value: v });
    }
  }
  return shoe;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// hi-lo count value
function countValue(card) {
  const v = card.value;
  if (['2','3','4','5','6'].includes(v)) return 1;
  if (['7','8','9'].includes(v)) return 0;
  return -1; // 10,J,Q,K,A
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value, 10);
}

function handScore(hand) {
  let score = 0;
  let aces = 0;
  for (const c of hand) {
    if (['J','Q','K'].includes(c.value)) score += 10;
    else if (c.value === 'A') { score += 11; aces++; }
    else score += parseInt(c.value, 10);
  }
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

function ensureShoe() {
  if (!shoeCreated || deck.length < SHUFFLE_THRESHOLD_CARDS) {
    deck = createShoe(SHOE_DECKS);
    shuffleInPlace(deck);
    runningCount = 0;
    shoeCreated = true;
    messageEl.textContent = 'reshuffled shoe';
  }
}

function drawCard() {
  if (deck.length === 0) {
    ensureShoe();
  }
  const c = deck.pop();
  runningCount += countValue(c);
  updateCountUI();
  return c;
}

function updateCountUI() {
  const cardsLeft = deck.length;
  const decksLeft = Math.max(0.1, cardsLeft / 52); // avoid division by 0
  const trueCount = runningCount / decksLeft;
  runningCountEl.textContent = (runningCount > 0 ? '+' + runningCount : runningCount);
  trueCountEl.textContent = (Math.round(trueCount * 10) / 10).toFixed(1);
  cardsLeftEl.textContent = cardsLeft;
  decksLeftEl.textContent = (Math.round(decksLeft * 10) / 10).toFixed(1);

  // hint
  if (trueCount >= 3) {
    countHintEl.textContent = 'player advantage - conditions favor player';
    countHintEl.classList.remove('bad');
    countHintEl.classList.add('good');
  } else if (trueCount <= -3) {
    countHintEl.textContent = 'dealer advantage - be careful';
    countHintEl.classList.remove('good');
    countHintEl.classList.add('bad');
  } else {
    countHintEl.textContent = 'neutral - no clear advantage';
    countHintEl.classList.remove('good','bad');
  }
}

// ui rendering - create card element with flip face/back
function createCardElement(card, faceUp = true, showBackByDefault = false) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  const inner = document.createElement('div');
  inner.className = 'card-inner';
  // front
  const front = document.createElement('div');
  front.className = 'card-face';
  front.textContent = card.value + card.suit;
  if (card.suit === '♥' || card.suit === '♦') front.classList.add('red');
  // back
  const back = document.createElement('div');
  back.className = 'card-back';
  // assemble
  inner.appendChild(front);
  inner.appendChild(back);
  wrapper.appendChild(inner);
  // if we want the back visible, set class accordingly
  if (showBackByDefault) wrapper.classList.remove('show-front');
  else wrapper.classList.add('show-front');
  // if faceUp explicitly false, show back
  if (!faceUp) wrapper.classList.remove('show-front');

  return wrapper;
}

function renderHands(revealDealer = false) {
  // dealer
  dealerHandDiv.innerHTML = '';
  dealerHand.forEach((card, idx) => {
    // hide dealer second card while round active and not revealDealer
    const showBack = (idx === 1 && roundActive && !revealDealer);
    const el = createCardElement(card, !showBack, showBack);
    dealerHandDiv.appendChild(el);
  });

  // player
  playerHandDiv.innerHTML = '';
  playerHand.forEach(card => {
    const el = createCardElement(card, true, false);
    playerHandDiv.appendChild(el);
  });

  playerScoreEl.textContent = 'player: ' + handScore(playerHand);
  dealerScoreEl.textContent = roundActive && !revealDealer ? 'dealer: ?' : 'dealer: ' + handScore(dealerHand);

  updateButtons();
  balanceEl.textContent = formatMoney(balance);
  bestEl.textContent = formatMoney(bestBalance);
}

// ui toggles
function updateButtons() {
  // bet must be positive and <= balance when pressing deal
  const betVal = parseFloat(betInput.value || 0);
  dealBtn.disabled = roundActive || (isNaN(betVal) || betVal < MIN_BET || betVal > balance);
  hitBtn.disabled = !roundActive;
  standBtn.disabled = !roundActive;
  // double allowed only immediately (firstAction true), exactly 2 cards, and enough balance to double
  doubleBtn.disabled = !(roundActive && firstAction && playerHand.length === 2 && balance >= stake);
  // keep split disabled for now (placeholder) but show if possible
  splitBtn.disabled = true;
  // lock bet when round active
  betInput.disabled = !!roundActive;
  maxBetBtn.disabled = !!roundActive;
  // show reset button when bankrupt
  if (balance <= 0) {
    resetBtn.style.display = 'inline-block';
  } else {
    resetBtn.style.display = 'none';
  }
}

// game flow
function deal() {
  ensureShoe();

  // parse bet
  let betVal = parseFloat(betInput.value || 0);
  if (!Number.isFinite(betVal) || betVal < MIN_BET) betVal = MIN_BET;
  if (betVal > balance) {
    messageEl.textContent = 'not enough balance for that bet';
    return;
  }
  betInput.value = Math.round(betVal);

  // start round
  roundActive = true;
  firstAction = true;
  stake = betVal;
  balance -= stake; // take stake up front
  messageEl.textContent = '';

  // clear and deal
  dealerHand = [ drawCard(), drawCard() ];
  playerHand = [ drawCard(), drawCard() ];

  renderHands();

  // immediate blackjack checks
  const playerBJ = (handScore(playerHand) === 21 && playerHand.length === 2);
  const dealerBJ = (handScore(dealerHand) === 21 && dealerHand.length === 2);

  if (playerBJ || dealerBJ) {
    // reveal dealer then settle
    renderHands(true);
    // if both have bj -> push
    setTimeout(() => {
      settleRound(true);
    }, 420);
  }
  updateButtons();
}

function hit() {
  if (!roundActive) return;
  playerHand.push(drawCard());
  firstAction = false;
  renderHands();
  if (handScore(playerHand) > 21) {
    // bust
    setTimeout(() => {
      renderHands(true);
      settleRound(false);
    }, 300);
  }
}

function stand() {
  if (!roundActive) return;
  firstAction = false;
  // reveal dealer and let dealer play
  renderHands(true);
  while (handScore(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
  setTimeout(() => settleRound(false), 420);
}

function doubleDown() {
  if (!(roundActive && firstAction && playerHand.length === 2)) return;
  if (balance < stake) {
    messageEl.textContent = 'not enough to double';
    return;
  }
  balance -= stake; // take extra equal stake
  stake = stake * 2;
  // give one card
  playerHand.push(drawCard());
  firstAction = false;
  renderHands();
  if (handScore(playerHand) > 21) {
    // player busts instantly
    setTimeout(() => {
      renderHands(true);
      settleRound(false);
    }, 300);
    return;
  }
  // otherwise dealer plays
  renderHands(true);
  while (handScore(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
  setTimeout(() => settleRound(false), 420);
}

function revealDealer() {
  renderHands(true);
}

// settle round
function settleRound(autoBlackjack = false) {
  roundActive = false;
  const ps = handScore(playerHand);
  const ds = handScore(dealerHand);
  let msg = '';

  // player bust
  if (ps > 21) {
    msg = 'you bust. dealer wins';
    // stake already taken
  } else {
    // blackjack special: player has initial two 21
    const playerInitBJ = (playerHand.length === 2 && ps === 21);
    const dealerInitBJ = (dealerHand.length === 2 && ds === 21);

    if (playerInitBJ && !dealerInitBJ) {
      // blackjack pays 3:2
      const payout = stake * 2.5; // return stake + 1.5 * stake
      balance += payout;
      msg = 'blackjack! paid 3 to 2';
    } else if (dealerInitBJ && !playerInitBJ) {
      msg = 'dealer blackjack. you lose';
      // stake lost
    } else if (ds > 21) {
      msg = 'dealer busts. you win';
      balance += stake * 2;
    } else if (ps > ds) {
      msg = 'you win';
      balance += stake * 2;
    } else if (ps < ds) {
      msg = 'dealer wins';
      // stake lost
    } else {
      msg = 'push';
      balance += stake; // return stake
    }
  }

  // housekeeping
  stake = 0;
  if (balance > bestBalance) bestBalance = balance;

  messageEl.textContent = msg;
  balanceEl.textContent = formatMoney(balance);
  bestEl.textContent = formatMoney(bestBalance);

  // reveal full hands
  renderHands(true);

  // unlock bet
  betInput.disabled = false;
  maxBetBtn.disabled = false;

  updateButtons();

  // if shoe needs shuffle after settlement, ensure
  if (deck.length < SHUFFLE_THRESHOLD_CARDS) {
    // leave runningCount as is until we reshuffle on next deal; show a subtle note
    messageEl.textContent += ' · shoe running low, will reshuffle on next deal';
  }

  // show reset if bankrupt
  if (balance <= 0) {
    resetBtn.style.display = 'inline-block';
  }
}

// reset game
function resetGame() {
  balance = START_BALANCE;
  bestBalance = START_BALANCE;
  runningCount = 0;
  shoeCreated = false;
  deck = [];
  playerHand = [];
  dealerHand = [];
  stake = 0;
  roundActive = false;
  firstAction = true;
  betInput.disabled = false;
  betInput.value = 100;
  messageEl.textContent = 'game reset. place a bet and deal';
  runningCountEl.textContent = '0';
  trueCountEl.textContent = '0.0';
  cardsLeftEl.textContent = SHOE_DECKS * 52;
  decksLeftEl.textContent = SHOE_DECKS.toFixed(1);
  resetBtn.style.display = 'none';
  renderHands();
}

// quick max bet
maxBetBtn.addEventListener('click', () => {
  betInput.value = Math.max(MIN_BET, Math.floor(balance));
});

// wire buttons
dealBtn.addEventListener('click', () => {
  messageEl.textContent = '';
  ensureShoe();
  deal();
});
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
doubleBtn.addEventListener('click', doubleDown);
splitBtn.addEventListener('click', () => { messageEl.textContent = 'split not implemented yet'; });
resetBtn.addEventListener('click', resetGame);

// initial setup
resetGame();
ensureShoe();
renderHands();
updateCountUI();
