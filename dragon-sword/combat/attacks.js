const damageCalculator = require('./damage-calculator');
const accuracyCalculator = require('./accuracy-calculator');

/**
 * Damage a monster via a character attack
 * @param {Character} attackingCharacter Character model attacking the monster
 * @param {Monster} targetMonster Monster model being attacked
 * @returns {{hit: Boolean, damageRoll: Number, rawDamageRoll: Number}} Object containing information about the attack
 */
function characterAttackMonster(attackingCharacter, targetMonster) {
    const hitsEnemy = accuracyCalculator.rollCharacterHitMonster(attackingCharacter);
    const characterDamageRoll = damageCalculator.rollCharacterDamageMonster(attackingCharacter);
    // Don't let damage take a monster into negative HP
  const cappedDamageRoll =
    targetMonster.healthCurrent - characterDamageRoll < 0
      ? targetMonster.healthCurrent
      : characterDamageRoll;

    if (hitsEnemy) {
	targetMonster.healthCurrent -= cappedDamageRoll;
    }

    return {
	    hit: hitsEnemy,
	    damageRoll: cappedDamageRoll,
	    rawDamageRoll: characterDamageRoll
    }
}

/**
 * Damage a character via a monster attack
 * @param {Monster} attackingMonster Monster model attacking the character
 * @param {Character} targetCharacter Character model being attacked
 * @returns {{damageRoll: Number, rawDamageRoll: Number}} Object containing information about the attack
 */
function monsterAttackCharacter(attackingMonster, targetCharacter) {
  const monsterDamageRoll = damageCalculator.rollMonsterDamageCharacter(attackingMonster);
  // Don't let damage take a character into negative HP
  const cappedMonsterDamage =
    targetCharacter.health - monsterDamageRoll < 0
      ? targetCharacter.health
      : monsterDamageRoll;

  // Damage character
  targetCharacter.health -= cappedMonsterDamage;

	return {
		damageRoll: cappedMonsterDamage,
		rawDamageRoll: monsterDamageRoll
	}
}

module.exports = {
	characterAttackMonster,
	monsterAttackCharacter
};
