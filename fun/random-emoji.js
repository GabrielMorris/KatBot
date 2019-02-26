module.exports = function RandomEmoji() {
  const Emoji = require('../models/emoji');

  return {
    execute: function(client, message) {
      Emoji.find((err, emoji) => {
        if (err) {
          console.error(err);

          return;
        }

        const randEmoji = Math.floor(Math.random() * emoji.length);

        const clientEmoji = client.emojis.find(
          cliEmoji => cliEmoji.name === emoji[randEmoji].name
        );

        if (clientEmoji) message.channel.send(clientEmoji.toString());
      });
    }
  };
};
