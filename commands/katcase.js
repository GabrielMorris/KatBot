exports.run = (client, message, args) => {
  const messageString = args.join(' ').toUpperCase();

  if (messageString.length === 0) {
    message.channel.send('Error - Must provide string to be KATCASED');

    return;
  }

  message.channel.send(messageString).catch(err => console.error(err));
};
