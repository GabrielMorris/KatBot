exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const Level = require('../models/levels');

  // If monster is alive
  Game.findOne({ guildID: message.guild.id }).then(game => {
    if (game && game.monsterAlive) {
      // Attack monster
      message.channel.send(
        `${message.author.username} hit ${game.monster.name} for ${
          game.monster.health
        } HP, killing it!`
      );

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
          message.channel.send(
            `${message.author.username} gained: **${game.monster.xpValue}xp**!`
          );
          // Kill monster in DB
          game.monsterAlive = false;
          game.monster = null;

          game.save();
        });
    } else {
      message.channel.send('There is no monster!');
    }
  });
};
