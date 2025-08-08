const { evaluateHandFrom7 } = require('./evaluator');

function makeGameManager(roomId, io) {
  const state = {
    id: roomId,
    players: [],
    deck: [],
    board: [],
    pot: 0,
    stage: 'waiting',
    dealerIndex: 0,
    currentBet: 0,
    turnIndex: 0,
    results: null,
  };

  function createDeck() {
    const ranks = '23456789TJQKA'.split('');
    const suits = ['s','h','d','c'];
    const d=[];
    for (const r of ranks) for (const s of suits) d.push(r+s);
    return d.sort(()=>Math.random()-0.5);
  }

  function addPlayer(p) {
    if (state.players.length >= 9) return false;
    state.players.push(Object.assign({ bet:0, folded:false, allIn:false, hand:[] }, p));
    return true;
  }

  function removePlayer(id) {
    const idx = state.players.findIndex(p=>p.id===id);
    if (idx!==-1) state.players.splice(idx,1);
  }

  function start() {
    state.deck = createDeck();
    state.board = [];
    state.pot = 0;
    state.stage = 'preflop';
    state.currentBet = 0;
    state.turnIndex = (state.dealerIndex + 1) % state.players.length;
    // deal
    state.players.forEach(p => { p.hand = [state.deck.pop(), state.deck.pop()]; p.folded=false; p.bet=0; p.allIn=false; });
  }

  function playerAction(id, action, amount=0) {
    const p = state.players.find(xx=>xx.id===id);
    if (!p) return;
    if (action==='fold') p.folded = true;
    else if (action==='call') {
      const toCall = state.currentBet - p.bet;
      const pay = Math.min(p.chips, toCall);
      p.chips -= pay;
      p.bet += pay;
      state.pot += pay;
      if (p.chips===0) p.allIn=true;
    } else if (action==='raise') {
      const raiseTo = amount;
      const add = raiseTo - p.bet;
      const pay = Math.min(p.chips, add);
      p.chips -= pay;
      p.bet += pay;
      state.currentBet = p.bet;
      state.pot += pay;
      if (p.chips===0) p.allIn=true;
    }
    // advance turn naive
    state.turnIndex = (state.turnIndex + 1) % state.players.length;
    // check everyone acted
    const active = state.players.filter(x=>!x.folded);
    const everyoneActed = active.every(x => x.bet === state.currentBet || x.allIn);
    if (everyoneActed) {
      if (state.stage === 'preflop') {
        state.stage = 'flop';
        state.board.push(state.deck.pop(), state.deck.pop(), state.deck.pop());
      } else if (state.stage === 'flop') {
        state.stage = 'turn';
        state.board.push(state.deck.pop());
      } else if (state.stage === 'turn') {
        state.stage = 'river';
        state.board.push(state.deck.pop());
      } else if (state.stage === 'river') {
        state.stage = 'showdown';
        // showdown simple: evaluate among non-folded
        const contenders = state.players.filter(p=>!p.folded);
        const scored = contenders.map(p => ({ id:p.id, score: evaluateHandFrom7([...p.hand, ...state.board]), name:p.name }));
        state.results = scored;
      }
      // reset bets for next round
      state.players.forEach(p=> p.bet = 0);
      state.currentBet = 0;
    }
  }

  function getState(){ return JSON.parse(JSON.stringify(state)); }

  return { addPlayer, removePlayer, start, playerAction, getState };
}

module.exports = { makeGameManager };
