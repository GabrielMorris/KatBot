const rngUtils = require('../../utils/rng-utils');

/**
 * Check whether a character must rest in order to fight
 * @param {Character} checkCharacter Character to check status of
 * @returns {Boolean} true if character must rest to fight further, false if character can fight without resting
 */
function checkCharacterMustRest(checkCharacter) {
  return checkCharacter.health === 0 ? true : false;
}

/**
 * Rolls whether a monster retaliates to a character attack (currently 50% chance)
 * @param {Monster} checkMonster Monster to check retaliation from
 * @returns {Boolean} true if monster would attack, false if monster would not attack
 */
function checkMonsterRetaliates(checkMonster) {
	// 50-50 chance
	const dieRoll = rngUtils.rollInt(1);

	return (dieRoll < 1 ? true : false);
}

/**
 * Check whether a monster is dead
 * @param {Monster} checkMonster Monster to check status of
 * @returns {Boolean} true if monster is dead, false if monster is alive
 */
function checkMonsterDead(checkMonster) {
  return checkMonster.healthCurrent <= 0 ? true : false;
}

/**
 * Check whether a character is dead
 * @param {Character} checkCharacter Character to check status of
 * @returns {Boolean} true if character is dead, false if character is alive
 */
function checkCharacterDead(checkCharacter) {
  return checkCharacter.health <= 0 ? true : false;
}

module.exports = {
	checkCharacterMustRest,
	checkMonsterRetaliates,
	checkMonsterDead,
	checkCharacterDead
}
