/* === STATE MANAGEMENT === */
// Sets the game state in Mongo
function setGameState(game, bool, monster = null) {
  game.monsterAlive = bool;
  game.monster = monster;

  game.save();
}

module.exports = { setGameState };
