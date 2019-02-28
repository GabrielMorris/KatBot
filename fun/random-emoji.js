module.exports = function RandomEmoji() {
  const Emoji = require('../models/emoji');
  const { randomArrayIndex } = require('../utils/utils');

  return {
    execute: function(client, message) {
      Emoji.find((err, emoji) => {
        if (err) {
          console.error(err);

          return;
        }

        const clientEmoji = client.emojis.find(
          cliEmoji => cliEmoji.name === emoji[randomArrayIndex(emoji)].name
        );

        if (clientEmoji) message.channel.send(clientEmoji.toString());
      });
    }
  };
};
