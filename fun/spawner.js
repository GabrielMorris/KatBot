// Models
const Game = require('../models/game/game');
const Monster = require('../models/game/monster');

// Utils
const { randomMonster } = require('../utils/utils');
const {
  setGameState,
  monsterEmbed,
  monsterIntro
} = require('../utils/game-utils');

function spawner(channel) {
  // Retrieve all the monsters from the database
  Monster.find()
    .then(monsters => {
      // Select a random monster
      const monster = randomMonster(monsters);

      // Find the game for the guild
      Game.findOne({ guildID: channel.guild.id })
        .then(gameDoc => setGameState(gameDoc, true, monster))
        .then(() => {
          // Generate the monster intro
          monsterIntro(monster).then(intro => {
            // Then send the intro and the monster embed to the channel
            channel.send(monsterEmbed(monster, intro));
          });
        });
    })
    .catch(err => console.error(err));
}

module.exports = { spawner };
