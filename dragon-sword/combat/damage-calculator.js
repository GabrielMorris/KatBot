const stats = require('../characters/stats');
const rngUtils = require('../../utils/rng-utils');

/**
 * Random chance (50/50) to return either 'positive' or 'negative'
 * @returns {String} 'positive' or 'negative' randomly
 */
function damageType() {
  return rngUtils.rollPercentage() < 0.5 ? 'positive' : 'negative';
}

/**
 * Calculates a random damage-deviation amount based on given combined-stat value
 * @param {Number} combinedStats Combined-stat value to use for damage-deviation calculation
 * @returns {Number} Number representing random damage-deviation amount
 */
function randomDamage(combinedStats) {
  return Math.ceil(rngUtils.rollPercentage() * (combinedStats * 0.1 * 0.2));
}

/**
 * Calculates final damage value for given combined stat value
 * @param {Number} combinedStats Combined-stat value to use for damage calculation
 * @returns {Number} Number representing damage amount
 */
function calculateCharacterAttackDamage(attackerStats) {
	const combinedAttackerStats = attackerStats.STR +attackerStats.AGI;
	const damageRand = randomDamage(combinedAttackerStats);

	return damageType() === 'positive'
	? Math.ceil(combinedAttackerStats * 0.1) + damageRand
	: Math.ceil(combinedAttackerStats * 0.1) - damageRand;
}

/**
 * Rolls damage caused by character attacking a monster
 * @param {Character} attackingCharacter Character model object attacking monster
 * @returns {Number} Integer representing amount of damage attack would cause
 */
function rollCharacterDamageMonster(attackingCharacter) {
	const characterStats = stats.getCharacterStats(attackingCharacter);
	return calculateCharacterAttackDamage(characterStats);
}

module.exports = {
	rollCharacterDamageMonster
};
