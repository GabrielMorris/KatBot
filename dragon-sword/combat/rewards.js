const stats = require('../characters/stats');
const gold = require('../money/gold');

/**
 * Calculates amount of gold a character would receive for killing a monster
 * @param {Character} character Character model object
 * @param {Monster} monster Monster model object
 * @returns {Number} Integer representing amount of gold character would gain
 */
function calculateCharacterRewardGold(character, monster) {
  const characterStats = stats.getCharacterStats(character);
  // calculate gold gain from character stats and monster health
  const goldEarned = gold.calculateMonsterKillGold(characterStats, monster.health);

  return goldEarned;
}

module.exports = {
	calculateCharacterRewardGold
}
