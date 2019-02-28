exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const Level = require('../models/levels');
  const MonsterOutro = require('../fun/monster-outro');

  const { setGameState, gameEmbed } = require('../utils/game-utils');

  // If monster is alive
  Game.findOne({ guildID: message.guild.id }).then(game => {
    if (game && game.monsterAlive) {
      // Attack monster
      const combatEmbed = gameEmbed({
        title: '**Combat**',
        text: `**${message.author.username}** hit **${
          game.monster.name
        }** for **${game.monster.health} HP**, killing it!`
      });

      message.channel.send(combatEmbed);

      // Reward XP
      Level.findOne({
        guildID: message.guild.id,
        memberID: message.author.id
      })
        .then(levelDoc => {
          levelDoc.experience += game.monster.xpValue;

          levelDoc.save();
        })

        .then(() => {
          message.channel.send(MonsterOutro(game.monster));
        })
        .then(() => {
          const xpEmbed = gameEmbed({
            title: '**XP gain**',
            text: `${message.author.username} gained: **${
              game.monster.xpValue
            }xp**!`
          });

          message.channel.send(xpEmbed);
        })
        .then(() => setGameState(game, false));
    } else {
      message.channel.send('There is no monster!');
    }
  });
};
