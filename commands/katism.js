exports.run = (client, message, args) => {
  const Katism = require('../models/katism');

  Katism.find()
    .then(katDocs => {
      const rand = Math.floor(Math.random() * katDocs.length);

      message.channel.send(katDocs[rand].text);
    })
    .catch(err => console.error(err));
};
