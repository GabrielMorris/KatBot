const Discord = require('discord.js');
const fs = require('fs');

const commands = fs.readdirSync('./commands');

exports.run = (client, message, args) => {
  console.log(commands);
  const commandArray = [];

  commands.forEach(command => {
    const commandSplit = command.split('');
    commandSplit.unshift(',');
    commandArray.push(commandSplit.join('').replace(/.js/, ''));
  });

  const embed = new Discord.RichEmbed()
    .setTitle('KatBot commands')
    .setColor('af2e1a')
    .setTimestamp()
    .addField('Commands', generateCommands(commandArray));

  message.channel.send({ embed }).catch(err => console.error(err));
};

function generateCommands(commands) {
  return commands.sort().join('\n');
}
