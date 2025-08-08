const RANKS = '23456789TJQKA'.split('');
const RANK_VALUE = Object.fromEntries(RANKS.map((r,i)=>[r,i]));

function combinations(arr, k) {
  const res = [];
  function go(start, chosen) {
    if (chosen.length === k) { res.push(chosen.slice()); return; }
    for (let i = start; i < arr.length; i++) { chosen.push(arr[i]); go(i+1, chosen); chosen.pop(); }
  }
  go(0, []);
  return res;
}

function cardValue(card) { return RANK_VALUE[card[0]]; }

function countRanks(cards) {
  const cnt = {};
  for (const c of cards) cnt[c[0]] = (cnt[c[0]]||0) + 1;
  return cnt;
}
function isFlush(cards) { return new Set(cards.map(c=>c[1])).size === 1; }

function uniqueDescRanks(cards) {
  return [...new Set(cards.map(c=>cardValue(c)).sort((a,b)=>b-a))];
}

function isStraightRanks(vals) {
  if (vals.length < 5) return false;
  for (let i=0;i<=vals.length-5;i++){
    let ok=true;
    for(let j=0;j<4;j++) if (vals[i+j]-1 !== vals[i+j+1]) ok=false;
    if (ok) return true;
  }
  // wheel
  const wheel = [12,3,2,1,0];
  if (wheel.every(v=>vals.includes(v))) return true;
  return false;
}

function evaluate5(cards) {
  const vals = cards.map(cardValue).sort((a,b)=>b-a);
  const counts = Object.values(countRanks(cards)).sort((a,b)=>b-a);
  const flush = isFlush(cards);
  const uniq = uniqueDescRanks(cards);
  const straight = isStraightRanks(uniq);

  if (straight && flush) return {cat:8, ranks: vals};
  if (counts[0]===4) return {cat:7, ranks: vals};
  if (counts[0]===3 && counts[1]===2) return {cat:6, ranks: vals};
  if (flush) return {cat:5, ranks: vals};
  if (straight) return {cat:4, ranks: vals};
  if (counts[0]===3) return {cat:3, ranks: vals};
  if (counts[0]===2 && counts[1]===2) return {cat:2, ranks: vals};
  if (counts[0]===2) return {cat:1, ranks: vals};
  return {cat:0, ranks: vals};
}

function compareScore(a,b){
  if (a.cat !== b.cat) return a.cat - b.cat;
  for (let i=0;i<a.ranks.length;i++){ if (a.ranks[i] !== b.ranks[i]) return a.ranks[i] - b.ranks[i]; }
  return 0;
}

function evaluateHandFrom7(cards7) {
  const combos = combinations(cards7,5);
  let best = null;
  for (const five of combos) {
    const score = evaluate5(five);
    if (!best || compareScore(score,best) > 0) best = score;
  }
  return best;
}

module.exports = { evaluateHandFrom7, RANKS };
