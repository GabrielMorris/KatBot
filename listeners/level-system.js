module.exports = function LevelSystem() {
  const random = require('random');

  const Level = require('../models/levels');
  const LevelConsts = require('../constants/level-consts');
  const { getUserRank } = require('../utils/utils');

  return {
    /**
     * Creates or updates a user's experience doc with XP based on a given message's length
     * @param {Discord.Message} message Discord message object to derive XP from
     * @returns {undefined}
     */
    // Creates or updates a user's experience doc
    execute: function(message) {
      Level.findOne({ memberID: message.member.id, guildID: message.guild.id })
        .then(levelDoc => {
          if (levelDoc) {
            // Get the length of the message and then generate a random amount of XP for the user between 1-100xp
            const messageLength = message.content.length;
            const randExp = Math.ceil(
              random.float() * (messageLength * LevelConsts.xpMultiplier)
            );
            const calculatedXP = _calculateXP(randExp);

            // Get the current rank based on previous XP
            const currentRank = getUserRank(levelDoc.experience);

            // Get the message channel and current xp value
            const channel = message.channel;
            const xp = levelDoc.experience;

            // Retrieve the last 10 messages on a channel
            channel
              .fetchMessages({ limit: 10 })
              .then(messages => {
                // If there are <= 1 messages or the author wasnt one of the last ten messages
                if (
                  messages.size <= 1 ||
                  !messages.find(msg => msg.member.id === message.member.id)
                ) {
                  // Increase XP by the random amount
                  levelDoc.experience += calculatedXP;
                } else {
                  // Otherwise create an array to hold the author's messages
                  const msgArr = [];

                  // For every message push the message to the array if they are from the author
                  messages.forEach(msg => {
                    if (msg.member.id === message.member.id) {
                      msgArr.push({
                        createdAt: msg.createdAt,
                        content: msg.content
                      });
                    }
                  });

                  // If we've got 2 or more messages get the time difference between them
                  if (msgArr.length >= 2) {
                    const timeDiff = msgArr[0].createdAt - msgArr[1].createdAt;

                    // If the time difference is greater than one minute award expereince
                    if (timeDiff > 60000) {
                      levelDoc.experience += calculatedXP;
                    }
                  } else {
                    // If there are less than 2 messages from the author award experience
                    levelDoc.experience += calculatedXP;
                  }
                }

                // Calculate the difference in experience
                const diff = levelDoc.experience - xp;

                // If the difference is greater than zero log what the diff is
                if (diff > 0) {
                  console.log(
                    `${
                      message.member.displayName
                    } earned ${levelDoc.experience - xp}xp on ${
                      message.guild.name
                    }`
                  );
                }

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
              })
              .catch(err => console.error(err));
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
    /**
     * Fetches a user's experience level from the data store
     * @param {Discord.Snowflake} memberID Discord user ID
     * @param {Discord.Snowflake} guildID Discord guild ID
     * @returns {Number|null} Number representing user experience count, or null if not found
     */
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

/**
 * Takes an experience number and caps it (currently at 20)
 * @private
 * @param {Number} xp Raw XP
 * @returns {Number} Capped XP
 */
function _calculateXP(xp) {
  return xp > 20 ? 20 : xp;
}
