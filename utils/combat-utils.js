const random = require('random');

/**
 * Calculates hit chance with random base-rate deviation based on given stats (capped at 90%)
 * @param {Object} stats Stat object to calculate hit rate from
 * @returns {Number} Float representing a hit percentage (capped at 0.9 representing 90%)
 */
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

/**
 * Calculates hit chance with based on given stats (capped at 90%), no random deviation
 * @param {Object} stats Stat object to calculate hit rate from
 * @returns {Number} Float representing a hit percentage (capped at 0.9 representing 90%)
 */
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

/*
 * Simulates a dice roll and returns a number between 0 and 1
 * @returns {Number} Random float between 0 and 1
 */
function rollDie() {
  return random.float(0, 1);
}

/**
 * Checks whether a hit was successful
 * @param {Number} hitChance Number representing hit chance
 * @param {Number} dieRoll Die roll to check against hit chance
 * @returns {Boolean} true if hit succeeds, false if fails
 */
function wasHit(hitChance, dieRoll) {
  return hitChance >= dieRoll;
}

/**
 * Random chance (50/50) to return either 'positive' or 'negative'
 * @returns {String} 'positive' or 'negative' randomly
 */
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
