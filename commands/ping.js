// Ping command swiped from Tildey
exports.run = (client, message, args) => {
  const dateInitialized = new Date(Date.now());
  const inboundDifference =
    dateInitialized.getTime() - message.createdAt.getTime();

  message.channel.send('PONG!').then(_message => {
    const outboundDifference =
      _message.createdAt.getTime() - dateInitialized.getTime();

    _message.edit(
      (_message.content += `\n\`(Received: ${inboundDifference}ms | Responded: ${outboundDifference}ms | Total: ${inboundDifference +
        outboundDifference}ms\``)
    );
  });
};
