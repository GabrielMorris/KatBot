module.exports = function LevelSystem() {
  const Level = require('../models/levels');
  const LevelConsts = require('../constants/level-consts');
  const { getUserRank } = require('../utils/utils');

  return {
    // Creates or updates a user's experience doc
    execute: function(message) {
      Level.findOne({ memberID: message.member.id, guildID: message.guild.id })
        .then(levelDoc => {
          if (levelDoc) {
            // Get the length of the message and then generate a random amount of XP for the user between 1-100xp
            const messageLength = message.content.length;
            const randExp = Math.ceil(
              Math.random() * (messageLength * LevelConsts.xpMultiplier)
            );

            // Get the current rank based on previous XP
            const currentRank = getUserRank(levelDoc.experience);

            // Increase XP by the random amount
            levelDoc.experience += _calculateXP(randExp);

            // console.log(
            //   `${message.member.displayName} earned ${_calculateXP(
            //     randExp
            //   )}xp on ${message.guild.name}`
            // );

            // Get the new rank
            const newRank = getUserRank(levelDoc.experience);

            // Compare rank names
            if (newRank.name !== currentRank.name) {
              // If they're different send a level up message
              message.channel.send(
                `<@${message.member.id}> has leveled up from **${
                  currentRank.name
                }** and become **${newRank.name}**!!!`
              );
            }

            // Save the updated MongoDoc
            levelDoc.save();
          } else {
            // Otherwise if no doc exists create one for the user on the guild
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

        return null;
      });
    }
  };
};

function _calculateXP(xp) {
  return xp > 50 ? 50 : xp;
}
