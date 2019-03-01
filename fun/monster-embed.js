const Discord = require('discord.js');
const EmbedConsts = require('../constants/embeds');

function monsterEmbed(monster, intro) {
  return new Discord.RichEmbed()
    .setThumbnail(monster.thumbnail)
    .setColor(EmbedConsts.color)
    .addField(
      '**New monster!**',
      `**${monster.name}** appeared with **${monster.health} HP**`
    )
    .addField('**Narrative**', intro);
}

module.exports = monsterEmbed;
