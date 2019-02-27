module.exports = function DragonSword(client) {
  const gameChannels = ['494574903173971971'];
  const Game = require('../models/game/game');
  const Monster = require('../models/game/monster');

  return {
    startGame: function() {
      gameChannels.forEach(channel => {
        const discordChannel = client.channels.get(channel);

        discordChannel.send('Let the game begin');

        Game.findOne({ guildID: discordChannel.guild.id })
          .then(gameGuildDoc => {
            console.log(gameGuildDoc);

            // If server doesn't have a game doc create one
            if (!gameGuildDoc) {
              Game.create({
                guildID: discordChannel.guild.id,
                monsterAlive: false
              });
            } else {
              // Otherwise find a monster
              Monster.find().then(monsters => {
                console.log(monsters);
                const monster = monsters[0];

                // Update game doc with monster
                gameGuildDoc.monsterAlive = true;
                gameGuildDoc.monster = monsters[0];

                gameGuildDoc.save();

                discordChannel.send(
                  `**${monster.name}** appeared with **${monster.health} HP**`
                );
              });
            }
          })
          .catch(err => console.error(err));
      });
    }
  };
};
