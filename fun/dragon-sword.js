module.exports = function DragonSword(client) {
  // Models
  const Game = require('../models/game/game');

  // Game utils
  const { spawner } = require('../fun/spawner');
  const { setGameState } = require('../utils/game-utils');

  // Channels
  const { gameChannels } = require('../constants/game');

  return {
    startGame: function() {
      gameChannels.forEach(channel => {
        const discordChannel = client.channels.get(channel);

        discordChannel.send(
          'You are now playing **DRAGON SWORD**!\n`,attack` to fight!'
        );

        Game.findOne({ guildID: discordChannel.guild.id })
          .then(gameGuildDoc => {
            // If server doesn't have a game doc create one
            if (!gameGuildDoc) {
              Game.create({
                guildID: discordChannel.guild.id,
                monsterAlive: false
              });
            } else {
              // Spawn monster and start spawn checker
              spawner(discordChannel);
              this._checkShouldSpawn(discordChannel);
            }
          })
          .catch(err => console.error(err));
      });
    },
    _checkShouldSpawn: function(channel) {
      // Get a random time between 1-5 mins
      const randTime = Math.random() * (300000 + 60000) + 60000;

      // Set a timer, after which we will check the game for the guild and see if the monster is alive
      setTimeout(() => {
        Game.findOne({ guildID: channel.guild.id }).then(gameDoc => {
          // If the monster is alive there's a 50/50 chance it will stick around or run away
          if (gameDoc.monsterAlive) {
            const rand = Math.random() * 100;

            if (rand < 50) {
              // Monster sticks around
              channel.send(
                `_The ${
                  gameDoc.monster.name
                } glances away from you, as if vying to escape..._`
              );
              this._checkShouldSpawn(channel);
            } else {
              // Monster flees the field of battle
              channel.send(
                `_The ${
                  gameDoc.monster.name
                } flees the field of battle as quickly as it came_`
              );

              // Update the MongoDoc
              setGameState(gameDoc, false);

              // Set a timer for 10 seconds that calls this function again to create an infinite spawn loop
              setTimeout(() => this._checkShouldSpawn(channel), 10000);
            }
          } else {
            // If the monster is dead we will call the spawner after a delay and create a new monster
            setTimeout(() => spawner(channel), 15000);

            // Set another, longer timer that will call this function again to continue the infinite spawn loop
            setTimeout(() => this._checkShouldSpawn(channel), 20000);
          }
        });
      }, randTime);
    }
  };
};
