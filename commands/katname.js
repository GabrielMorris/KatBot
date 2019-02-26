exports.run = (client, message, args) => {
  const { guild } = message;
  const str = args.join(' ');

  const kat = guild.members.find(member => {
    return member.id === '371151824331210755';
  });

  const currentName = kat.displayName;

  if (str.length < 32) {
    kat
      .setNickname(str)
      .then(
        message.channel.send(
          `Updated **${currentName}'s** nickname to **${str}**! :D :D :D`
        )
      )
      .catch(err => console.error(err));
  } else {
    message.channel.send('Error: nick: Must be 32 or fewer in length.');
  }
};
