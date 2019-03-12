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

module.exports = { setGameState };
