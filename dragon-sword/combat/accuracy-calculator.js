// libraries
const random = require('random');

// utils
const rngUtils = require('../../utils/rng-utils');

const stats = require('../characters/stats');

/**
 * Calculates hit chance with random base-rate deviation based on given stats (capped at 90%)
 * @private
 * @param {Object} characterStats Stat object to calculate hit rate from
 * @returns {Number} Float representing a hit percentage (capped at 0.9 representing 90%)
 */
function calculateHitChance(characterStats) {
  // 0.3-0.5 random base range
  const baseHitChance = random.float(0.55, 0.7);
  // Formula: STR * 0.25 + AGI * 0.5 / 100 TODO: move to constant
  const charHitChanceBonus = (characterStats.STR * 0.25 + characterStats.AGI * 0.5) / 100;

  // Cap hit rate to 90%
  const hitChance =
    baseHitChance + charHitChanceBonus > 0.9
      ? 0.9
      : (baseHitChance + charHitChanceBonus).toFixed(2);

  return hitChance;
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
 * Calculates a random result for whether a character's attack would hit a monster
 * @param {Character} attackingCharacter Character model object attacking monster
 * @returns {Boolean} true if attack would hit, false if attack would miss
 */
function rollCharacterHitMonster(attackingCharacter) {
	const characterStats = stats.getCharacterStats(attackingCharacter);
	// chance for character's attack to hit
	const hitChance = calculateHitChance(characterStats);
	// rng
	const dieRoll = rngUtils.rollPercentage();

	return wasHit(hitChance, dieRoll);
}

module.exports = {
	rollCharacterHitMonster
};
