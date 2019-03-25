const combatAttacks = require('./attacks');
const combatChecks = require('./condition-checks.js');
const rewards = require('./rewards');
const levels = require('../characters/levels');
const stateUtils = require('../../utils/state-utils');
const characterUtils = require('../../utils/character-utils');

/**
 * Executes character attack phase of combat
 * @private
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @returns {Object} Object containing updated combat state
 */
function executeCharacterAttackPhase(combatState) {
  const phaseInfo = {
    attack: null
  };
  // Attack monster
  phaseInfo.attack = combatAttacks.characterAttackMonster(
    combatState.character,
    combatState.monster
  );
  combatState.phases.characterAttackPhase = phaseInfo;
  return combatState;
}

/**
 * Executes monster attack phase of combat
 * @private
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @returns {Object} Object containing updated combat state
 */
function executeMonsterAttackPhase(combatState) {
  const phaseInfo = {
    attack: null
  };

  // exit phase immediately if monster is dead
  if (combatChecks.checkMonsterDead(combatState.monster)) {
    return combatState;
  }

  // monster attack check
  const monsterRetaliates = combatChecks.checkMonsterRetaliates(
    combatState.monster
  );

  // monster attack succeeds
  if (monsterRetaliates) {
    phaseInfo.attack = combatAttacks.monsterAttackCharacter(
      combatState.monster,
      combatState.character
    );
  }

  combatState.phases.monsterAttackPhase = phaseInfo;
  return combatState;
}

/**
 * Executes a reward phase of combat based on a combat state object and sends Discord message feedback
 * @private
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @returns {Object} Modified combat state
 */
function executeRewardStep(combatState) {
  const rewardInfo = {
    gold: null,
    experience: null
  };

  const rewardCharacter = combatState.character;
  const rewardMonster = combatState.monster;

  // only grant rewards if monster is dead
  if (combatChecks.checkMonsterDead(combatState.monster)) {
    // Get the character's current level
    const oldLevel = levels.getCharacterLevel(rewardCharacter);

    // Grant rewards post-combat
    const combatRewardsEarned = rewards.rewardCharacterCombat(
      rewardCharacter,
      rewardMonster
    );

    rewardInfo.gold = combatRewardsEarned.gold;
    rewardInfo.experience = combatRewardsEarned.experience;

    // Get the level again
    const newLevel = levels.getCharacterLevel(rewardCharacter);

    // If the levels are different, then they've leveled up
    if (oldLevel.level !== newLevel.level) {
      // Get the old/new stats object and level up the character
      const stats = characterUtils.handleLevelUp(
        rewardCharacter,
        oldLevel,
        newLevel
      );

      combatState.levelUp = {
        oldLevel,
        newLevel,
        statDiff: stats
      };

      // Get the new base stats
      const baseStats = characterUtils.calculateStats(
        combatState.character,
        newLevel
      );

      // Set characters HP to max
      combatState.character.health = baseStats.HP;
    }
  }

  combatState.rewards = rewardInfo;

  return combatState;
}

/**
 * Executes a round of attacks based on a combat state object
 * @private
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @returns {Object} Modified combat state
 */
function executeCombatStep(combatState) {
  executeCharacterAttackPhase(combatState);
  executeMonsterAttackPhase(combatState);

  return combatState;
}

/**
 * Executes combat state save to datastore
 * @private
 * @param {Object} combatState Object containing information about the round of combat
 * @returns {Promise.<Object>} Promise resolving to modified combat state
 */
function executeSaveStep(combatState) {
  combatState.game.markModified('monster');

  const saveMonsterAlive = !combatChecks.checkMonsterDead(combatState.monster);

  return stateUtils
    .setGameState(combatState.game, saveMonsterAlive, combatState.monster)
    .then(() => {
      return combatState.character.save();
    })
    .then(() => {
      combatState.saved = true;
      return combatState;
    });
}

/**
 * Executes combat and saves state
 * @param {Object} combatState Object containing information about the round of combat
 * @returns {Promise.<Object>} Promise resolving to modified combat state
 */
function executeCombat(combatState) {
  let combatStateUpdated;

  combatStateUpdated = executeCombatStep(combatState);
  combatStateUpdated = executeRewardStep(combatState);

  return executeSaveStep(combatState);
}

module.exports = {
  executeCombat
};
