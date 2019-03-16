// combat functions
const combatStateUtil = require('../dragon-sword/combat/combat-state');
const combatAttacks = require('../dragon-sword/combat/attacks');
const combatChecks = require('../dragon-sword/combat/condition-checks.js');
const rewards = require('../dragon-sword/combat/rewards');
const levels = require('../dragon-sword/characters/levels');

// other utils
const stateUtils = require('../utils/state-utils');
const characterUtils = require('../utils/character-utils');
const embedUtils = require('../utils/embed-utils');

/**
 * Executes a reward phase of combat based on a combat state object and sends Discord message feedback
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @param {Discord.<User>} messageUserTarget User to target Discord message feedback toward
 * @param {Discord.<GuildChannel>} messageChannelTarget Channel to target Discord message feedback toward
 * @returns {Object} Modified combat state
 */
function executeRewardStep(combatState, messageUserTarget, messageChannelTarget) {
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

			// Create and send the level up embed
			const lvlUpEmbed = embedUtils.levelUpEmbed(
				oldLevel,
				newLevel,
				stats,
				messageUserTarget.username
			);

			messageChannelTarget.send(lvlUpEmbed);
		}
	}

	combatState.rewards = rewardInfo;
	return combatState;
}

/**
 * Executes character attack phase of combat
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @param {Discord.<User>} messageUserTarget User to target Discord message feedback toward
 * @param {Discord.<GuildChannel>} messageChannelTarget Channel to target Discord message feedback toward
 * @returns {Promise.<{messages: Array.<Discord.<Message>>, attack: Object}>} Promise resolving to object with phase info
 */
function executeCharacterAttackPhase(combatState, messageUserTarget, messageChannelTarget) {
	const phaseInfo = {
		messages: [],
		attack: null
	};
	// Attack monster
	phaseInfo.attack = combatAttacks.characterAttackMonster(combatState.character, combatState.monster);

	// Attack monster message
	const embedThumbnail = characterUtils.getCharacterClass(combatState.character).thumbnail;
	return messageChannelTarget.send(embedUtils.combatEmbed(
		messageUserTarget.username,
		combatState.monster,
		phaseInfo.attack.hit ? phaseInfo.attack.damageRoll : 0,
		embedThumbnail
	)).then(attackMessage => {
		phaseInfo.messages.push(attackMessage);
		return phaseInfo;
	});;
}

/**
 * Executes monster attack phase of combat
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @param {Discord.<User>} messageUserTarget User to target Discord message feedback toward
 * @param {Discord.<GuildChannel>} messageChannelTarget Channel to target Discord message feedback toward
 * @returns {Promise.<{messages: Array.<Discord.<Message>>, attack: Object}>} Promise resolving to object with phase info
 */
function executeMonsterAttackPhase(combatState, messageUserTarget, messageChannelTarget) {
	const phaseInfo = {
		messages: [],
		attack: null
	};

	// exit phase immediately if monster is dead
	if (combatChecks.checkMonsterDead(combatState.monster)) {
		return Promise.resolve(phaseInfo);
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

	// attack/miss message regardless
	return messageChannelTarget.send(
		embedUtils.monsterAttackEmbed(
			messageUserTarget.username,
			combatState.character,
			combatState.monster,
			monsterRetaliates ? phaseInfo.attack.damageRoll : 0,
		)
	).then(attackMessage => {
		phaseInfo.messages.push(attackMessage);
		return phaseInfo;
	});
}

/**
 * Executes a round of combat based on a combat state object and sends Discord message feedback to specified user/channel
 * @param {Object} combatState Object containing information about the round of combat to execute
 * @param {Discord.<User>} messageUserTarget User to target Discord message feedback toward
 * @param {Discord.<GuildChannel>} messageChannelTarget Channel to target Discord message feedback toward
 * @returns {Object} Modified combat state
 */
function executeCombatStep(combatState, messageUserTarget, messageChannelTarget) {
	const combatPhases = {
		characterAttackPhase: null,
		monsterAttackPhase: null
	};

	// execute character attack phase
	return executeCharacterAttackPhase(combatState, messageUserTarget, messageChannelTarget)
	.then(characterAttackPhase => {
	// execute monster attack phase
		combatPhases.characterAttackPhase = characterAttackPhase;
		return executeMonsterAttackPhase(combatState, messageUserTarget, messageChannelTarget);
	}).then(monsterAttackPhase => {
		combatPhases.monsterAttackPhase = monsterAttackPhase;
		combatState.phases = combatPhases;
		return combatState;
	});
}

/**
 * Executes post-combat actions
 * @param {Object} combatState Object containing information about the round of combat
 * @param {Discord.<User>} messageUserTarget User to target Discord message feedback toward
 * @param {Discord.<GuildChannel>} messageChannelTarget Channel to target Discord message feedback toward
 * @returns {Object} Modified combat state
 */
function executePostCombatStep(combatState, messageUserTarget, messageChannelTarget) {
	const postCombatInfo = {
		monsterOutro: null,
		rewards: null,
		rest: null
	};

	// beginning of conditional promise chain
	let promiseChain = Promise.resolve();

	if (combatChecks.checkMonsterDead(combatState.monster)) {
		promiseChain = messageChannelTarget.send(embedUtils.combatOutroEmbed(combatState.monster))
		.then(outroMessage => {
			postCombatInfo.monsterOutro = outroMessage;
		});
	}
	if (combatState.rewards && (combatState.rewards.experience || combatState.rewards.gold)) {
		promiseChain = messageChannelTarget.send(
			embedUtils.combatRewardEmbed(
				messageUserTarget.username,
				combatState.rewards.experience,
				combatState.rewards.gold
			)
		).then(rewardMessage => {
			postCombatInfo.rewards = rewardMessage;
		});
	}
	if (combatChecks.checkCharacterDead(combatState.character)) {
		promiseChain = messageChannelTarget.send(embedUtils.mustRestEmbed(messageUserTarget.username))
		.then(restMessage => {
			postCombatInfo.restMessage = restMessage;
		});
	}

	// execute conditional promise chain
	return promiseChain.then(() => {
		combatState.postCombat = postCombatInfo;
		return combatState;
	});
}

/**
 * Executes combat state save to datastore
 * @param {Object} combatState Object containing information about the round of combat
 * @param {Discord.<User>} messageUserTarget User to target Discord message feedback toward
 * @param {Discord.<GuildChannel>} messageChannelTarget Channel to target Discord message feedback toward
 * @returns {Object} Modified combat state
 */
function executeSaveStep(combatState, messageUserTarget, messageChannelTarget) {
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

exports.run = (client, message, args) => {
  const { channel, guild, author } = message;

  return combatStateUtil.getDiscordGuildCombatState(author, guild).then(combatState => {
	  // if user has no character, they need to register one before playing the game
	  if (!combatState.character) {
		combatState.rejectMessage = channel.send(embedUtils.noCharacterEmbed());
		return Promise.resolve(combatState);
	  }
	  // if there's no monster, there's no fight, so we're done
	  if (!combatState.monster) {
		combatState.rejectMessage = channel.send('There is no monster!');
		return Promise.resolve(combatState);
	  }
	  // if character must rest, they can't fight
	  if (combatChecks.checkCharacterMustRest(combatState.character)) {
		combatState.rejectMessage = channel.send(embedUtils.mustRestEmbed(author.username));
		return Promise.resolve(combatState);
	  }
	  // OK to fight, execute round of combat
	 return executeCombatStep(combatState, author, channel)
	.then(combatStateRes => {
	// calculate and assign rewards
		return executeRewardStep(combatStateRes, author, channel);
	}).then(combatStateRes => {
	// post-combat messages
		return executePostCombatStep(combatStateRes, author, channel);
	}).then(combatStateRes => {
		if (combatStateRes.rejectMessage) {
			return Promise.resolve(false);
		}
		  // save state if all is well...
		return executeSaveStep(combatStateRes, author, channel);
	});
  }).then(combatStateRes => {
	  return combatStateRes;
  }).catch(err => {
	  console.error(err);
	  channel.send('There was an error and combat has been halted.');
	  return err;
  });
};
