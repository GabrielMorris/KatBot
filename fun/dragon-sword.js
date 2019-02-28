module.exports = function DragonSword(client) {
  const Discord = require('discord.js');
  const EmbedConsts = require('../constants/embeds');

  // Models
  const Game = require('../models/game/game');
  const Monster = require('../models/game/monster');

  // Game utils
  const { spawner } = require('../fun/spawner');

  // Channels
  const gameChannels = ['550454349608779777']; // '494574903173971971'

  return {
    startGame: function() {
      gameChannels.forEach(channel => {
        const discordChannel = client.channels.get(channel);

        discordChannel.send('You are now playing **DRAGON SWORD**!');

        Game.findOne({ guildID: discordChannel.guild.id })
          .then(gameGuildDoc => {
            // console.log(gameGuildDoc);

            // If server doesn't have a game doc create one
            if (!gameGuildDoc) {
              Game.create({
                guildID: discordChannel.guild.id,
                monsterAlive: false
              });
            } else {
              // Otherwise find a monster
              Monster.find().then(monsters => {
                // TODO: update this when we have more monsters
                // console.log(monsters);
                const monster = monsters[0];

                // Update game doc with monster
                gameGuildDoc.monsterAlive = true;
                gameGuildDoc.monster = monsters[0];

                gameGuildDoc.save();

                const embed = new Discord.RichEmbed()
                  .setThumbnail('https://i.imgur.com/HEAqOzS.gif')
                  .setColor(EmbedConsts.color)
                  .addField(
                    '**New monster!**',
                    `**${monster.name}** appeared with **${monster.health} HP**`
                  );

                discordChannel.send({ embed });

                this._checkShouldSpawn(discordChannel);
              });
            }
          })
          .catch(err => console.error(err));
      });
    },
    _checkShouldSpawn: function(channel) {
      const randTime = Math.random() * (300000 + 60000) + 60000;

      console.log('Checking if should spawn in ' + randTime);

      setTimeout(() => {
        Game.findOne({ guildID: channel.guild.id }).then(gameDoc => {
          if (gameDoc.monsterAlive) {
            // Call this function again
            console.log(
              'Time for monster to run away or call this function again'
            );

            const rand = Math.random() * 100;

            if (rand < 50) {
              // Monster sticks around
              console.log('Monster is staying');

              channel.send(
                `_The ${
                  gameDoc.monster.name
                } glances away from you, as if vying to escape..._`
              );
              this._checkShouldSpawn(channel);
            } else {
              // Monster flees the field of battle
              console.log('Monster is fleeing');

              channel.send(
                `_The ${
                  gameDoc.monster.name
                } flees the field of battle as quickly as it came_`
              );

              gameDoc.monsterAlive = false;
              gameDoc.monster = null;

              gameDoc.save();

              setTimeout(() => {
                console.log('Checking if we should spawn');
                this._checkShouldSpawn(channel);
              }, 10000);
            }
          } else {
            console.log('Monster dead, call spawner');

            // Call spawner
            setTimeout(() => {
              console.log('Calling spawner');

              spawner(channel);
            }, 15000);

            setTimeout(() => {
              console.log('Checking to see if we should spawn');

              this._checkShouldSpawn(channel);
            }, 20000);
          }
        });
      }, randTime);
    }
  };
};
