exports.run = (client, message, args) => {
  const { Attachment } = require('discord.js');
  const memes = require('../constants/memes');

  const meme = new Attachment(memes.kat);

  message.channel
    .send(
      'ALL HAIL KAT, <@371151824331210755>\nKAT APPRECIATION DAY\nKAT APPRECIATION DAY\nKAT APPRECIATION DAY\nKAT APPRECIATION DAY',
      meme
    )
    .catch(err => console.error(err));
};
