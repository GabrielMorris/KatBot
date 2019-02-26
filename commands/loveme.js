exports.run = (client, message, args) => {
  const RandomEmoji = require('../fun/random-emoji')();

  RandomEmoji.execute(client, message);
};
