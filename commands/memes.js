exports.run = (client, message, args) => {
  const { createEmbed } = require('../utils/utils');

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

  const embedOpts = {
    image: 'memes',
    fields: [{ name: '**KatBot Memes**', value: commands.join('\n') }]
  };

  message.channel.send(createEmbed(embedOpts)).catch(err => console.error(err));
};
