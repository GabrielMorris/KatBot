exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const MonsterOutro = require('../fun/monster-outro');
  const Character = require('../models/game/character');

  const { setGameState, gameEmbed } = require('../utils/game-utils');

  // If monster is alive
  Game.findOne({ guildID: message.guild.id }).then(game => {
    if (game && game.monsterAlive) {
      // See if we have a character on this guild
      Character.findOne({
        guildID: message.guild.id,
        memberID: message.author.id
      })
        .then(character => {
          // If we have no character send a message explaining how to register
          if (!character) {
            message.channel.send(
              'You dont have a character - register with `,character new <className> <pronouns>`'
            );

            // Return false so the next then statements dont execute
            return false;
          } else {
            // Attack monster
            const combatEmbed = gameEmbed({
              title: '**Combat**',
              text: `**${message.author.username}** hit **${
                game.monster.name
              }** for **${game.monster.health} HP**, killing it!`
            });

            message.channel.send(combatEmbed);

            // Reward XP
            character.experience += game.monster.xpValue;
            character.save();

            // Return true so the then statements will execute
            return true;
          }
        })
        .then(hasChar => {
          if (!hasChar) return hasChar;

          const outroEmbed = gameEmbed({
            title: '**Narrative**',
            text: MonsterOutro(game.monster)
          });

          message.channel.send(outroEmbed);

          return true;
        })
        .then(hasChar => {
          if (!hasChar) return hasChar;

          const xpEmbed = gameEmbed({
            title: '**XP gain**',
            text: `**${message.author.username}** gained: **${
              game.monster.xpValue
            }xp**!`
          });

          message.channel.send(xpEmbed);

          return true;
        })
        .then(hasChar => {
          if (!hasChar) return;

          setGameState(game, false);
        });
    } else {
      message.channel.send('There is no monster!');
    }
  });
};
