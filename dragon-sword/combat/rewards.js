const stats = require('../characters/stats');
const gold = require('../money/gold');

/**
 * Rewards experience to a character post-combat
 * @private
 * @param {Character} rewardCharacter Character model object to grant experience to
 * @param {Monster} killedMonster Monster model that was killed
 * @returns {Number} Amount of experience earned
 */
function rewardCharacterCombatExperience(rewardCharacter, killedMonster) {
	const experienceAmount = killedMonster.xpValue;
	rewardCharacter.experience += experienceAmount;
	return experienceAmount;
}

/**
 * Rewards gold to a character post-combat
 * @private
 * @param {Character} rewardCharacter Character model object to grant gold to
 * @param {Number} goldAmount Amount of gold to grant to the character
 * @returns {Number} Amount of gold earned
 */
function rewardCharacterCombatGold(rewardCharacter, killedMonster) {
	const goldAmount = calculateCharacterRewardGold(rewardCharacter, killedMonster);
	rewardCharacter.gold += goldAmount;
	return goldAmount;
}

/**
 * Rewards character post-combat
 * @param {Character} rewardCharacter Character model to reward
 * @param {Monster} killedMonster Monster model that was killed
 * @returns {Object} Object detailing combat rewards
 */
function rewardCharacterCombat(rewardCharacter, killedMonster) {
	return {
		experience: rewardCharacterCombatExperience(rewardCharacter, killedMonster),
		gold: rewardCharacterCombatGold(rewardCharacter, killedMonster)
	}
}

/**
 * Calculates amount of gold a character would receive for killing a monster
 * @param {Character} character Character model object
 * @param {Monster} monster Monster model object
 * @returns {Number} Integer representing amount of gold character would gain
 */
function calculateCharacterRewardGold(rewardCharacter, killedMonster) {
  const characterStats = stats.getCharacterStats(rewardCharacter);

  // calculate gold gain from character stats and monster health
  return gold.calculateMonsterKillGold(characterStats, killedMonster.health);
}


module.exports = {
	rewardCharacterCombat,
	calculateCharacterRewardGold
}
