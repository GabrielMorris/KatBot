exports.run = (client, message, args) => {
  const { Attachment } = require('discord.js');

  const meme = new Attachment('https://i.imgur.com/vDsQ3kH.jpg');

  message.channel
    .send('<@371151824331210755> Hello I am Kat, nice to meet you!', meme)
    .catch(err => console.error(err));
};
