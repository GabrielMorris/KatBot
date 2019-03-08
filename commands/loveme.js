exports.run = (client, message, args) => {
  const RandomEmoji = require('../listeners/random-emoji')();

  RandomEmoji.execute(client, message);
};
