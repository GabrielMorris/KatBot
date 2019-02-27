exports.run = (client, message, args) => {
  const LevelSystem = require('../fun/level-system')();
  const LevelConsts = require('../constants/level-consts');
  const { createEmbed, getUserRank } = require('../utils/utils');

  if (args.find(arg => arg.toLowerCase() === 'ranks')) {
    const ranks = LevelConsts.ranks.map(
      rank => `Rank: **${rank.name}** - LVL UP: **${rank.maxXP}xp**`
    );

    const embedOpts = {
      image: 'rank',
      fields: [{ name: '**Guild Ranks**', value: ranks.join('\n') }]
    };

    message.channel
      .send(createEmbed(embedOpts))
      .catch(err => console.error(err));

    return;
  }

  // If >3 users let the user know that they've exceeded max mentions per request
  if (args.length > 3) {
    message.channel.send(
      "You are amazing and I love you, but you can only retrieve 3 experience reports at a time ;_; ||I'm sorry||"
    );

    return;
  }

  // No args === get own rank
  if (args.length === 0) {
    return _sendRankEmbed(message.author, message);
  }

  // Loop over every mention and send a rank embed
  message.mentions.users.forEach(user => _sendRankEmbed(user, message));

  function _sendRankEmbed(user, message) {
    LevelSystem.getUserExperience(user.id, message.guild.id).then(xp => {
      // If no XP from a MongoDoc send a message saying that user has no XP
      if (!xp) {
        message.channel.send(
          `<@${user.id}> might be lovely, but they have no experience here :(`
        );

        return;
      }

      // Get the user's rank based on XP
      const rank = getUserRank(xp);

      const embedOpts = {
        image: 'rank',
        fields: [
          {
            name: `**${user.username} Report**`,
            value: `Experience: **${xp}xp**\nRank: **${rank.name}**\nGuild: **${
              message.guild.name
            }**`
          }
        ]
      };

      // Send the embed
      message.channel
        .send(createEmbed(embedOpts))
        .catch(err => console.error(err));
    });
  }
};
