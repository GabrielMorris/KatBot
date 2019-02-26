exports.run = (client, message, args) => {
  const emojiList = client.emojis.find(emoji => emoji.name === 'cocoalovesyou');
  console.log(emojiList);
  message.reply(emojiList.toString());
};
