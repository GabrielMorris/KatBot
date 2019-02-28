exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const Level = require('../models/levels');
  const MonsterOutro = require('../fun/monster-outro');

  const { setGameState } = require('../utils/game-utils');

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
          message.channel.send(MonsterOutro(game.monster));
        })
        .then(() => {
          message.channel.send(
            `${message.author.username} gained: **${game.monster.xpValue}xp**!`
          );
        })
        .then(() => setGameState(game, false));
    } else {
      message.channel.send('There is no monster!');
    }
  });
};
