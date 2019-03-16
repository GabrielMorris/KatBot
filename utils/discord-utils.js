/**
 * Writes all given messages in order to a Discord channel
 * @param {Array} messageBuffer Array of contents to write to a Discord channel
 * @param {Discord.<TextChannel>} channel Discord channel to write to
 * @returns {Array} messageResults Array of results from each message send
 */
function writeAllMessageBuffer(messageBuffer, channel) {
  const messageResults = [];
  return messageBuffer
    .reduce((previousPromise, nextMessage) => {
      return previousPromise.then(messageRes => {
        if (messageRes) {
          messageResults.push(messageRes);
        }
        return channel.send(nextMessage);
      });
    }, Promise.resolve())
    .then(finalMessage => {
      if (finalMessage) {
        messageResults.push(finalMessage);
      }
      return messageResults;
    });
}

module.exports = {
  writeAllMessageBuffer
};
