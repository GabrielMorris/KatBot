const Discord = require('discord.js');

const Game = require('../models/game/game');
const Monster = require('../models/game/monster');

const EmbedConsts = require('../constants/embeds');

function spawner(channel) {
  Monster.find()
    .then(monsters => {
      // TODO: update this when we have more monsters
      const monster = monsters[0];

      Game.findOne({ guildID: channel.guild.id })
        .then(gameDoc => {
          gameDoc.monsterAlive = true;
          gameDoc.monster = monster;

          gameDoc.save();
        })
        .then(() => {
          const embed = new Discord.RichEmbed()
            .setThumbnail('https://i.imgur.com/HEAqOzS.gif')
            .setColor(EmbedConsts.color)
            .addField(
              '**New monster!!**',
              `**${monster.name}** appeared with **${monster.health} HP**`
            );

          channel.send({ embed });
        });
    })
    .catch(err => console.error(err));
}

module.exports = { spawner };
