exports.run = (client, message, args) => {
  const Discord = require('discord.js');
  const LevelSystem = require('../fun/level-system')();
  const LevelConsts = require('../constants/level-consts');
  const EmbedConsts = require('../constants/embeds');

  if (args.find(arg => arg.toLowerCase() === 'ranks')) {
    const ranks = LevelConsts.ranks.map(
      rank => `Rank: **${rank.name}** - XP required: **${rank.minXP}**`
    );

    const embed = new Discord.RichEmbed()
      .setColor(EmbedConsts.color)
      .setThumbnail(EmbedConsts.images.rank)
      .addField('**Guild Ranks**', ranks.join('\n'));

    message.channel.send({ embed }).catch(err => console.error(err));

    return;
  }

  if (args.length > 3) {
    message.channel.send(
      "You are amazing and I love you, but you can only retrieve 3 experience reports at a time ;_; ||I'm sorry||"
    );

    return;
  }

  if (args.length === 0) {
    return LevelSystem.getUserExperience(
      message.author.id,
      message.guild.id
    ).then(xp => {
      if (!xp) {
        message.channel.send(
          `You might be lovely, but they have no experience here :(`
        );

        return;
      }

      // TODO: improve this
      const rank = LevelConsts.ranks.find(rank => xp < rank.minXP);

      const embed = new Discord.RichEmbed()
        .setColor('af2e1a')
        .setThumbnail(EmbedConsts.images.rank)
        .addField(
          `**${message.author.username} Report**`,
          `Experience: **${xp}xp**\nRank: **${rank.name}**\nGuild: **${
            message.guild.name
          }**`
        );

      message.channel.send({ embed }).catch(err => console.error(err));

      return;
    });
  }

  message.mentions.users.forEach(user => {
    LevelSystem.getUserExperience(user.id, message.guild.id).then(xp => {
      if (!xp) {
        message.channel.send(
          `<@${user.id}> might be lovely, but they have no experience here :(`
        );

        return;
      }

      // TODO: improve this
      const rank = LevelConsts.ranks.find(rank => xp < rank.minXP);

      const embed = new Discord.RichEmbed()
        .setColor(EmbedConsts.color)
        .setThumbnail(EmbedConsts.images.rank)
        .addField(
          `**${user.username} Report**`,
          `Experience: **${xp}xp**\nRank: **${rank.name}**\nGuild: **${
            message.guild.name
          }**`
        );

      message.channel.send({ embed }).catch(err => console.error(err));
    });
  });
};
