const Game = require('../../models/game/game');
const Character = require('../../models/game/character');

const combatChecks = require('./condition-checks.js');

/**
 * Fetches the Game model associated with a Discord guild (server), if one exists
 * @private
 * @param {Discord.<Guild>} targetGuild Discord Guild object to find game from
 * @returns {Game|null} Game model associated with Discord guild or null if none exists
 */
function getDiscordGuildGame(targetGuild) {
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
function getDiscordGuildCombatState(characterOwner, targetGuild) {
	const combatState = {
		game: null,
		character: null,
		characterOwner: characterOwner,
		monster: null,
		phases: {
			characterAttackPhase: null,
			monsterAttackPhase: null
		},
		rewards: null,
		levelUp: null,
		rejectMessage: null,
		postCombat: null,
		messageBuffer: []
	};


	// find game if one exists on server
	return getDiscordGuildGame(targetGuild).then(guildGame => {
		if (!guildGame) {
			// server should have a game instance
			throw new Error(`Attempted to get combat state for server ${targetGuild.id} but it does not have a game instance`);
		}
		else {
			// assign game if one's found
			combatState.game = guildGame;
			// assign monster if one is alive
			if (guildGame.monster && !combatChecks.checkMonsterDead(guildGame.monster)) {
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

module.exports = {
	getDiscordGuildCombatState
};
