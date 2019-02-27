exports.run = (client, message, args) => {
  const memes = require('../constants/memes');

  message.channel.send(memes.cocoa);
};
