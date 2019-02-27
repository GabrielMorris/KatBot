const Discord = require('discord.js');
const EmbedConsts = require('../constants/embeds');
const LevelConsts = require('../constants/level-consts');

function createEmbed(embedOpts) {
  const { image, fields, title } = embedOpts;

  const embed = new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .setThumbnail(EmbedConsts.images[image]);

  if (title) embed.setTitle(title);

  fields.forEach(field => embed.addField(field.name, field.value));

  return embed;
}

function getUserRank(xp) {
  return LevelConsts.ranks.find(rank => xp < rank.maxXP);
}

module.exports = { createEmbed, getUserRank };
