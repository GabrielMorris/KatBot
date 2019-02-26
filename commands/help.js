exports.run = (client, message, args) => {
  const Discord = require('discord.js');
  const EmbedConsts = require('../constants/embeds');

  const embed = new Discord.RichEmbed()
    .setTitle('**KatBot commands**')
    .setColor(EmbedConsts.color)
    .setThumbnail(EmbedConsts.images.help)
    .addField('**,help**', 'Display this message with command help')
    .addField(
      '**,rank <@user1, @users2?, ... || ranks>**',
      'Provides current guild level and rank information for user(s). If no arguments provided this will provide your rank or up to three users may be mentioned to get their ranking information. Alternatively `,rank ranks` will show all available ranks.'
    )
    .addField(
      '**,top**',
      'Displays the top 10 users on the server based on experience sorted in descending order.'
    )
    .addField(
      '**,katname <string>**',
      "Changes Kat's name to the specified string, which has a maximum length of 32 characters per Discord name policy."
    )
    .addField(
      '**,katcase <string>**',
      'Sends a message to the channel with the provided string in KATCASE!'
    )
    .addField(
      '**,memes**',
      'Lists all currently available Kat memes for your endless entertainment.'
    );

  message.channel.send({ embed }).catch(err => console.error(err));
};
