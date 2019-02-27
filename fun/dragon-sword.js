module.exports = function DragonSword(client) {
  const Discord = require('discord.js');
  const EmbedConsts = require('../constants/embeds');

  // Models
  const Game = require('../models/game/game');
  const Monster = require('../models/game/monster');

  // Channels
  const gameChannels = ['494574903173971971', '550454349608779777'];

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
                    '**New monster!!**',
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
      setTimeout(() => {
        console.log('Checking for monster status');
        Game.findOne({ guildID: channel.guild.id }).then(gameDoc => {
          if (gameDoc.monsterAlive) {
            // Call this function again
            console.log(
              'Time for monster to run away or call this function again'
            );

            const rand = Math.random() * 100;

            if (rand < 50) {
              // Monster sticks around
              this._checkShouldSpawn(channel);
            } else {
              // Monster flees the field of battle
            }
          } else {
            console.log('Monster dead, call spawner');

            // Call spawner
          }
        });
      }, 5000);
    }
  };
};
