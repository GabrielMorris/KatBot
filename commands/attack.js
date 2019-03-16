// combat functions
const combatStateUtil = require('../dragon-sword/combat/combat-state');
const combatAttacks = require('../dragon-sword/combat/attacks');
const combatChecks = require('../dragon-sword/combat/condition-checks.js');
const rewards = require('../dragon-sword/combat/rewards');
const levels = require('../dragon-sword/characters/levels');

// other utils
const discordUtils = require('../utils/discord-utils');
const stateUtils = require('../utils/state-utils');
const characterUtils = require('../utils/character-utils');
const embedUtils = require('../utils/embed-utils');

/**
 * Executes a reward phase of combat based on a combat state object and sends Discord message feedback
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
		const combatRewardsEarned = rewards.rewardCharacterCombat(rewardCharacter, rewardMonster);
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
		}
	}

	combatState.rewards = rewardInfo;
	return combatState;
}

/**
 * Executes character attack phase of combat
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @returns {Object} Object containing updated combat state
 */
function executeCharacterAttackPhase(combatState) {
	const phaseInfo = {
		attack: null
	};
	// Attack monster
	phaseInfo.attack = combatAttacks.characterAttackMonster(combatState.character, combatState.monster);
	combatState.phases.characterAttackPhase = phaseInfo;
	return combatState;
}

/**
 * Executes monster attack phase of combat
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
	const monsterRetaliates = combatChecks.checkMonsterRetaliates(combatState.monster);

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
 * Executes a round of combat based on a combat state object
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
 * @param {Object} combatState Object containing information about the round of combat
 * @returns {Promise.<Object>} Promise resolving to modified combat state
 */
function executeSaveStep(combatState) {
	combatState.game.markModified('monster');

	const saveMonsterAlive = !(combatChecks.checkMonsterDead(combatState.monster));

	return stateUtils.setGameState(combatState.game, saveMonsterAlive, combatState.monster)
	.then(() => {
		return combatState.character.save();
	}).then(() => {
		combatState.saved = true;
		return combatState;
	});
}

/**
 * Creates Discord messages to send after combat
 * @param {Object} combatState Combat state object
 * @returns {Array} Array of (unsent) messages
 */
function createCombatStateEmbeds(combatState) {
	const messages = [];
	// character attack
	const embedThumbnail = characterUtils.getCharacterClass(combatState.character).thumbnail;
	const embedDamage = (combatState.phases.characterAttackPhase && combatState.phases.characterAttackPhase.attack.hit)
		? combatState.phases.characterAttackPhase.attack.damageRoll : 0;

	messages.push(
		embedUtils.combatEmbed(
			combatState.characterOwner.username,
			combatState.monster,
			embedDamage,
			embedThumbnail
		)
	);
	// monster attack
	const monsterEmbedDamage = (combatState.phases.monsterAttackPhase && combatState.phases.monsterAttackPhase.attack)
		? combatState.phases.monsterAttackPhase.attack.damageRoll : 0;

	if (!combatChecks.checkMonsterDead(combatState.monster)) {
		messages.push(
			embedUtils.monsterAttackEmbed(
				combatState.characterOwner.username,
				combatState.character,
				combatState.monster,
				monsterEmbedDamage
			)
		);
	}
	// level up
	if (combatState.levelUp) {
		messages.push(
			embedUtils.levelUpEmbed(
				combatState.levelUp.oldLevel,
				combatState.levelUp.newLevel,
				combatState.levelUp.statDiff,
				combatState.characterOwner.username
			)
		);
	}
	// monster outro
	if (combatChecks.checkMonsterDead(combatState.monster)) {
		messages.push(embedUtils.combatOutroEmbed(combatState.monster));
	}
	// rewards
	if (combatState.rewards && (combatState.rewards.experience || combatState.rewards.gold)) {
		messages.push(
			embedUtils.combatRewardEmbed(
				combatState.characterOwner.username,
				combatState.rewards.experience,
				combatState.rewards.gold
			)
		);
	}
	// need to rest
	if (combatChecks.checkCharacterDead(combatState.character)) {
		messages.push(embedUtils.mustRestEmbed(combatState.characterOwner.username));
	}

	return messages;
}

function executeCombat(combatState) {
	let combatStateUpdated;
	combatStateUpdated = executeCombatStep(combatState);
	combatStateUpdated = executeRewardStep(combatState);
	return executeSaveStep(combatState);
}

exports.run = (client, message, args) => {
  const { channel, guild, author } = message;

  return combatStateUtil.getDiscordGuildCombatState(author, guild).then(combatState => {
	  // if user has no character, they need to register one before playing the game
	  if (!combatState.character) {
		combatState.rejectMessage = channel.send(embedUtils.noCharacterEmbed());
		return combatState;
	  }
	  // if there's no monster, there's no fight, so we're done
	  if (!combatState.monster) {
		combatState.rejectMessage = channel.send('There is no monster!');
		return combatState;
	  }
	  // if character must rest, they can't fight
	  if (combatChecks.checkCharacterMustRest(combatState.character)) {
		combatState.rejectMessage = channel.send(embedUtils.mustRestEmbed(author.username));
		return combatState;
	  }

	  // OK to fight, execute round of combat
	 return executeCombat(combatState)

  }).then(combatStateRes => {
	const combatStateEmbeds = createCombatStateEmbeds(combatStateRes)
	return discordUtils.writeAllMessageBuffer(combatStateEmbeds, channel);
  }).catch(err => {
	  console.error(err);
	  channel.send('There was an error and combat has been halted.');
	  return err;
  });
};
