/**
 * Saves/set the game's state in datastore
 * @param {Game} game Target game to save state from
 * @param {Boolean} bool Boolean marking whether game's current monster is alive (true) or not (false)
 * @param {Monster|null} [monster=null] Game state's current monster
 * @returns {undefined}
 */
function setGameState(game, bool, monster = null) {
  game.monsterAlive = bool;
  game.monster = monster;

  game.save();
}

/**
 * Retrieves an array of Discord channel IDs this bot runs Dragon Sword on
 * @returns {Array.<String>} Array of Discord channel IDs
 */
function getGameChannels() {
  const gameChannelsRaw = process.env.GAME_CHANNELS;
  if (!gameChannelsRaw) {
    throw new Error(
      'GAME_CHANNELS is a required environment variable and is currently unset'
    );
  }
  return gameChannelsRaw.split(';');
}

/**
 * Retrieves an array of Discord user IDs this bot allows to execute game admin functions
 * @returns {Array.<String>} Array of Discord user IDs
 */
function getGameMasters() {
  const gameMastersRaw = process.env.GAME_MASTERS;
  if (!gameMastersRaw) {
    throw new Error(
      'GAME_MASTERS is a required environment variable and is currently unset'
    );
  }
  return gameMastersRaw.split(';');
}

/**
 * Retrieves the bot's current name
 * @returns {String}
 */
function getBotName() {
  return process.env.BOT_NAME;
}

module.exports = { setGameState, getGameChannels, getGameMasters, getBotName };
