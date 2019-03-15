const { goldMultipliers } = require('../../constants/game');
const rngUtils = require('../../utils/rng-utils');

/**
 * Calculates the amount of gold earned in an encounter based on given stats and monster HP
 * @param {Object} stats Object representing character stats
 * @param {Number} monsterBaseHP Rewarding monster's base HP
 */
function calculateMonsterKillGold(characterStats, monsterBaseHP) {
  // Calculate gold and luck bonus
  const multiplierGold = goldMultipliers.baseGoldMult * monsterBaseHP;
  const luckBonus = characterStats.LUCK / 4;

  const randomBonus = Math.ceil(rngUtils.rollPercentage()* (multiplierGold + luckBonus));
  const shouldGiveRandom = rngUtils.rollInt(1) === 1 ? true : false;

  let goldEarned = Math.ceil(multiplierGold);

  if (shouldGiveRandom) {
    goldEarned += randomBonus;
  }

  return goldEarned;
}

module.exports = {
	calculateMonsterKillGold
};
