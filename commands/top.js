exports.run = (client, message, args) => {
  const Level = require('../models/levels');
  const guildID = message.guild.id;
  const { createEmbed } = require('../utils/utils');

  Level.find({ guildID })
    .sort({ experience: -1 })
    .then(levelDocs => {
      let docs;

      if (!args[0]) {
        docs = levelDocs.slice(0, 10);
      } else if (args[0] === '2') {
        docs = levelDocs.slice(10, 20);
      } else if (args[0] === '3') {
        docs = levelDocs.slice(20, 30);
      } else {
        docs = levelDocs.slice(0, 10);
      }

      const topArray = docs.map(
        doc =>
          `${_getIndex(doc, levelDocs)}. <@${doc.memberID}> - ${
            doc.experience
          }xp`
      );

      const embedOpts = {
        image: 'top',
        fields: [
          {
            name: `**${message.guild.name} rankings**`,
            value: topArray.join('\n')
          }
        ]
      };

      message.channel
        .send(createEmbed(embedOpts))
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};

function _getIndex(doc, mongoDocs) {
  // const found = mongoDocs.find(mDoc => mDoc.memberID === doc.memberID);
  let index;

  mongoDocs.forEach((item, i) => {
    if (item.memberID === doc.memberID) {
      index = i;
    }
  });

  return index + 1;
}
