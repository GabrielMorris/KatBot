const Discord = require('discord.js');
const EmbedConsts = require('../constants/embeds');

function monsterEmbed(monster) {
  return new Discord.RichEmbed()
    .setThumbnail(monster.thumbnail)
    .setColor(EmbedConsts.color)
    .addField(
      '**New monster!**',
      `**${monster.name}** appeared with **${monster.health} HP**`
    );
}

module.exports = monsterEmbed;
