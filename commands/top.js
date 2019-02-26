exports.run = (client, message, args) => {
  const Discord = require('discord.js');
  const Level = require('../models/levels');
  const guildID = message.guild.id;
  const EmbedConsts = require('../constants/embeds');

  Level.find({ guildID })
    .sort({ experience: -1 })
    .limit(10)
    .then(levelDocs => {
      const topArray = levelDocs.map(
        (doc, index) => `${index + 1}. <@${doc.memberID}> - ${doc.experience}xp`
      );

      const embed = new Discord.RichEmbed()
        .setColor(EmbedConsts.color)
        .setThumbnail(EmbedConsts.images.top)
        .addField(`**${message.guild.name} rankings**`, topArray.join('\n'));

      message.channel.send({ embed }).catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};
