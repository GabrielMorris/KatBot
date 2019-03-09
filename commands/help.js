exports.run = (client, message, args) => {
  const { createEmbed } = require('../utils/utils');

  const embedOpts = {
    image: 'help',
    title: '**KatBot Commands**',
    fields: [
      { name: '**,help**', value: 'Display this message with command help' },
      {
        name: '**,rank <@user1, @users2?, ... || ranks>**',
        value:
          'Provides current guild level and rank information for user(s). If no arguments provided this will provide your rank or up to three users may be mentioned to get their ranking information. Alternatively `,rank ranks` will show all available ranks.'
      },
      {
        name: '**,top**',
        value:
          'Displays the top 10 users on the server based on experience sorted in descending order.'
      },
      {
        name: '**,katname <string>**',
        value:
          "Changes Kat's name to the specified string, which has a maximum length of 32 characters per Discord name policy."
      },
      {
        name: '**,memes**',
        value:
          'Lists all currently available Kat memes for your endless entertainment.'
      },
      { name: '**,katism**', value: 'Says something... Kat-y' }
    ]
  };

  message.channel.send(createEmbed(embedOpts)).catch(err => console.error(err));
};
