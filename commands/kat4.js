exports.run = (client, message, args) => {
  const { Attachment } = require('discord.js');

  const meme = new Attachment('https://i.imgur.com/M3jFXdh.png');

  message.channel
    .send('<@371151824331210755>', meme)
    .catch(err => console.error(err));
};
