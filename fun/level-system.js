module.exports = function LevelSystem() {
  const Level = require('../models/levels');
  const LevelConsts = require('../constants/level-consts');

  return {
    // Creates or updates a user's experience doc
    execute: function(message) {
      Level.findOne({ memberID: message.member.id, guildID: message.guild.id })
        .then(levelDoc => {
          if (levelDoc) {
            const messageLength = message.content.length;
            const randExp = Math.ceil(
              Math.random() * (messageLength * LevelConsts.xpMultiplier)
            );

            levelDoc.experience += randExp > 100 ? 100 : randExp;

            levelDoc.save();
          } else {
            Level.create({
              memberID: message.member.id,
              guildID: message.guild.id,
              experience: 1
            });
          }
        })
        .catch(err => console.error(err));
    },
    getUserExperience: function(memberID, guildID) {
      return Level.findOne({ memberID, guildID }).then(levelDoc => {
        if (levelDoc) {
          return levelDoc.experience;
        }

        console.log('No level doc for user');
        return null;
      });
    }
  };
};
