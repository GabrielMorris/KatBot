// combat functions
const combat = require('../dragon-sword/combat/combat');
const combatStateUtil = require('../dragon-sword/combat/combat-state');
const combatChecks = require('../dragon-sword/combat/condition-checks.js');

// other utils
const discordUtils = require('../utils/discord-utils');
const characterUtils = require('../utils/character-utils');
const embedUtils = require('../utils/embed-utils');

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
	 return combat.executeCombat(combatState)

  }).then(combatStateRes => {
	const combatStateEmbeds = createCombatStateEmbeds(combatStateRes)
	return discordUtils.writeAllMessageBuffer(combatStateEmbeds, channel);
  }).catch(err => {
	  console.error(err);
	  channel.send('There was an error and combat has been halted.');
	  return err;
  });
};
