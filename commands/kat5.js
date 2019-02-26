exports.run = (client, message, args) => {
  const { Attachment } = require('discord.js');

  const meme = new Attachment('https://i.imgur.com/i2rTM23.jpg');

  message.channel
    .send('<@371151824331210755>', meme)
    .catch(err => console.error(err));
};
