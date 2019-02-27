exports.run = (client, message, args) => {
  const { Attachment } = require('discord.js');
  const memes = require('../constants/memes');

  const meme = new Attachment(memes.kat3);

  message.channel
    .send('<@371151824331210755> Hello I am Kat, nice to meet you!', meme)
    .catch(err => console.error(err));
};
