exports.run = (client, message, args) => {
  const Katism = require('../models/katism');
  const { randomArrayIndex } = require('../utils/utils');

  Katism.find()
    .then(katDocs => {
      message.channel.send(katDocs[randomArrayIndex(katDocs)].text);
    })
    .catch(err => console.error(err));
};
