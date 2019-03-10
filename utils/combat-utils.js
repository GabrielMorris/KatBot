const random = require('random');

function calculateHitChance(stats) {
  // 0.3-0.5 random base range
  const baseHitChance = random.float(0.5, 0.7);
  // Formula: STR * 0.25 + AGI * 0.5 / 100 TODO: move to constant
  const charHitChanceBonus = (stats.STR * 0.25 + stats.AGI * 0.5) / 100;

  // Cap hit rate to 90%
  const hitChance =
    baseHitChance + charHitChanceBonus > 0.9
      ? 0.9
      : (baseHitChance + charHitChanceBonus).toFixed(2);

  return hitChance;
}

function calculateFlatHitChance(stats) {
  // 0.3-0.5 random base range
  const baseHitChance = 0.5;
  // Formula: STR * 0.25 + AGI * 0.5 / 100 TODO: move to constant
  const charHitChanceBonus = (stats.STR * 0.25 + stats.AGI * 0.5) / 100;

  // Cap hit rate to 90%
  const hitChance =
    baseHitChance + charHitChanceBonus > 0.9
      ? 0.9
      : (baseHitChance + charHitChanceBonus).toFixed(2);

  return hitChance;
}

// Roll die 0-1
function rollDie() {
  return random.float(0, 1);
}

// Returns true if hit > die roll
function wasHit(hitChance, dieRoll) {
  return hitChance >= dieRoll;
}

// Returns positive or negative based on chance
function damageType() {
  return random.int(0, 100) < 50 ? 'positive' : 'negative';
}

// Calculates random damage based on stats
function randomDamage(combinedStats) {
  return Math.ceil(random.float() * (combinedStats * 0.1 * 0.2));
}

// Return the damage +/- random damage
function attackDamage(combinedStats) {
  const damageRand = randomDamage(combinedStats);

  return damageType() === 'positive'
    ? Math.ceil(combinedStats * 0.1) + damageRand
    : Math.ceil(combinedStats * 0.1) - damageRand;
}

module.exports = {
  calculateHitChance,
  rollDie,
  wasHit,
  attackDamage,
  calculateFlatHitChance
};
