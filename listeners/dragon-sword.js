module.exports = function DragonSword(client) {
  const random = require('random');

  // Models
  const Game = require('../models/game/game');
  const Monster = require('../models/game/monster');

  // Game utils
  const { spawner } = require('../dragon-sword/spawner');
  const {
    monsterFailsToFlee,
    monsterFlees
  } = require('../utils/narrative-utils');
  const { startGameEmbed } = require('../utils/embed-utils');

  // Channels
  const { gameChannels } = require('../constants/game');

  return {
    /**
     * Starts game in each Discord TextChannel with an ID listed in game channel constants
     * @returns {undefined}
     */
    startGame: function() {
      gameChannels.forEach(channel => {
        const discordChannel = client.channels.get(channel);

        discordChannel.send(startGameEmbed());

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
    /**
     * Once called, periodically checks (by recursively calling itself) whether a new monster should spawn in specified channel
     * if there is no monster currently alive in the channel, and spawns a new monster if criteria is met;
     * otherwise, checks whether current monster should flee and triggers an appropriate message in response
     * @private
     * @param {Discord.TextChannel} channel Discord text channel to check spawn for
     * @returns {undefined}
     */
    _checkShouldSpawn: function(channel) {
      // this function needs to be refactored into smaller tasks

      // Get a random time between 1.5-3 mins
      const randTime = random.int(90000, 210000);

      console.log(
        `Checking for spawn in: ${(randTime / 60000).toFixed(2)}min in ${
          channel.guild.name
        }`
      );

      // Set a timer, after which we will check the game for the guild and see if the monster is alive
      setTimeout(() => {
        Game.findOne({ guildID: channel.guild.id }).then(gameDoc => {
          // If the monster is alive there's a 50/50 chance it will stick around or run away
          if (gameDoc.monsterAlive) {
            // Get the monster template
            Monster.findOne({ name: gameDoc.monster.name }).then(monster => {
              // Get the monster's initial HP and compare it to the game doc's monster's HP.
              // If the monster's HP is less than the threshold it won't be able to flee
              const monsterInitHP = monster.health;
              const monsterCantFleeThresholdPercentage = 0.5;
              const monsterCantFlee =
                gameDoc.monster.health / monsterInitHP <
                monsterCantFleeThresholdPercentage
                  ? true
                  : false;

              // Get a random number 0-99
              const rand = random.int(0, 99);

              if (rand < 50 || monsterCantFlee) {
                // Monster sticks around
                monsterFailsToFlee(channel, gameDoc.monster);
                this._checkShouldSpawn(channel);
              } else {
                // Monster flees the field of battle
                monsterFlees(channel, gameDoc);

                // Set a timer for 10 seconds that calls this function again to create an infinite spawn loop
                setTimeout(() => this._checkShouldSpawn(channel), 10000);
              }
            });
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
