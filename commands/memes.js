exports.run = (client, message, args) => {
  const Discord = require('discord.js');
  const EmbedConsts = require('../constants/embeds');

  const commands = [
    ',android',
    ',ethnics',
    ',ethnics2',
    ',kat',
    ',kat2',
    ',kat3',
    ',kat4',
    ',kat5',
    ',kat6'
  ];

  const embed = new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .setThumbnail(EmbedConsts.images.memes)
    .addField('**KatBot Memes**', commands.join('\n'));

  message.channel.send({ embed }).catch(err => console.error(err));
};
