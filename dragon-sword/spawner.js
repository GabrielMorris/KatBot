// Models
const Game = require('../models/game/game');
const Monster = require('../models/game/monster');

// Utils
const { randomMonster } = require('../utils/utils');
const { setGameState } = require('../utils/state-utils');
const { monsterIntro } = require('../utils/narrative-utils');
const { monsterEmbed } = require('../utils/embed-utils');

/**
 * Spawns a new monster into game state and sends an intro message to specified channel
 * @param {Discord.TextChannel} channel Discord text channel to send monster intro embed to
 * @returns {undefined}
 */
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
