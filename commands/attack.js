// models
const Game = require('../models/game/game');
const Character = require('../models/game/character');

const damageCalculator = require('../dragon-sword/combat/damage-calculator');
const accuracyCalculator = require('../dragon-sword/combat/accuracy-calculator');
const rewards = require('../dragon-sword/combat/rewards');
const levels = require('../dragon-sword/characters/levels');

// utils
const stateUtils = require('../utils/state-utils');
const characterUtils = require('../utils/character-utils');
const embedUtils = require('../utils/embed-utils');
const rngUtils = require('../utils/rng-utils');

/**
 * Check whether a character must rest in order to fight
 * @param {Character} checkCharacter Character to check status of
 * @returns {Boolean} true if character must rest to fight further, false if character can fight without resting
 */
function checkCombatCharacterMustRest(checkCharacter) {
  return checkCharacter.health === 0 ? true : false;
}

/**
 * Rolls whether a monster retaliates to a character attack (currently 50% chance)
 * @param {Monster} checkMonster Monster to check retaliation from
 * @returns {Boolean} true if monster would attack, false if monster would not attack
 */
function rollMonsterRetaliates(checkMonster) {
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

/**
 * Damage a monster via a character attack
 * @param {Character} attackingCharacter Character model attacking the monster
 * @param {Monster} targetMonster Monster model being attacked
 * @returns {{hit: Boolean, damageRoll: Number, rawDamageRoll: Number}} Object containing information about the attack
 */
function combatCharacterAttackMonster(attackingCharacter, targetMonster) {
    const hitsEnemy = accuracyCalculator.rollCharacterHitMonster(
      attackingCharacter
    );
    const characterDamageRoll = damageCalculator.rollCharacterDamageMonster(
      attackingCharacter
    );
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
function combatMonsterAttackCharacter(attackingMonster, targetCharacter) {
  // Don't let damage take a character into negative HP
  const monsterDamageRoll = damageCalculator.rollMonsterDamageCharacter(
    attackingMonster
  );
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

/**
 * Fetches the Game model associated with a Discord guild (server), if one exists
 * @param {Discord.<Guild>} targetGuild Discord Guild object to find game from
 * @returns {Game|null} Game model associated with Discord guild or null if none exists
 */
function getGuildGame(targetGuild) {
  return Game.findOne({ guildID: targetGuild.id }).then(game => {
	  return (game ? game : null);
  });
}

/**
 * Fetches information about a Discord server's combat state for a particular Discord user
 * @param {Discord.<User>} characterOwner Discord User object that owns the character
 * @param {Discord.<Guild>} targetGuild Discord Guild object to check
 * @returns {Object} Information about the target game's combat state
 */
function getGameCombatState(characterOwner, targetGuild) {
	const combatState = {
		game: null,
		character: null,
		monster: null,
		phases: null,
		rewards: null,
		rejectMessage: null,
		postCombat: null
	};


	// find game if one exists on server
	return getGuildGame(targetGuild).then(guildGame => {
		if (!guildGame) {
			// server should have a game instance
			throw new Error(`Attempted to get combat state for server ${targetGuild.id} but it does not have a game instance`);
		}
		else {
			// assign game if one's found
			combatState.game = guildGame;
			// assign monster if one is alive
			if (guildGame.monster && !checkMonsterDead(guildGame.monster)) {
				combatState.monster = guildGame.monster;
			}
		}
		// find character associated with this game
		return Character.findOne({
			guildID: targetGuild.id,
			memberID: characterOwner.id
		});
	}).then(combatCharacter => {
		// assign character if one is found for user on server
		if (combatCharacter) {
			combatState.character = combatCharacter;
		}
		return combatState;
	});
}

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
	if (checkMonsterDead(combatState.monster)) {
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
	phaseInfo.attack = combatCharacterAttackMonster(combatState.character, combatState.monster);

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
	if (checkMonsterDead(combatState.monster)) {
		return Promise.resolve(phaseInfo);
	}

	// monster attack check
	const monsterRetaliates = rollMonsterRetaliates(combatState.monster);

	if (monsterRetaliates) {
		// retaliation
		phaseInfo.attack = combatMonsterAttackCharacter(
			combatState.monster,
			combatState.character
		);

		return messageChannelTarget.send(
			embedUtils.monsterAttackEmbed(
				messageUserTarget.username,
				combatState.character,
				combatState.monster,
				phaseInfo.attack.damageRoll
			)
		).then(attackMessage => {
			phaseInfo.messages.push(attackMessage);
			return combatState.character.save();
		}).then(() => {
			return phaseInfo;
		});
	}
	else {
		// monster does nothing
		return messageChannelTarget.send(`${combatState.monster.name} waits quietly...`)
		.then(waitMessage => {
			phaseInfo.messages.push(waitMessage);
			return phaseInfo;
		});
	}
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

	if (checkMonsterDead(combatState.monster)) {
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
	if (checkCharacterDead(combatState.character)) {
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

	const saveMonsterAlive = !(checkMonsterDead(combatState.monster));

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

  return getGameCombatState(author, guild).then(combatState => {
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
	  if (checkCombatCharacterMustRest(combatState.character)) {
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
	});
  }).then(combatState => {
	 // skip state save if combat didn't happen
	if (combatState.rejectMessage) {
		return Promise.resolve(false);
	}
	  // save state if all is well...
	return executeSaveStep(combatState, author, channel);
  }).then(combatStateRes => {
	  return combatStateRes;
  }).catch(err => {
	  console.error(err);
	  channel.send('There was an error and combat has been halted.');
	  return err;
  });
};
