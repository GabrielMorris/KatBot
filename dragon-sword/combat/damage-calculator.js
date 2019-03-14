// utils 
const combatUtils = require('../../utils/combat-utils');

const stats = require('../characters/stats');


/**
 * Calculates damage caused by character attacking a monster
 * @param {Character} attackingCharacter Character model object attacking monster
 * @returns {Number} Integer representing amount of damage attack would cause
 */
function rollCharacterDamageMonster(attackingCharacter) {
	const characterStats = stats.getCharacterStats(attackingCharacter);
	const combinedStats = characterStats.STR +characterStats.AGI;

	return combatUtils.attackDamage(combinedStats);
}

module.exports = {
	rollCharacterDamageMonster
};
