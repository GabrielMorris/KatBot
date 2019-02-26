require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const CommandSystem = require('./command-system')();

client.on('ready', () => {
  setGameMessage('Appreciating Kat');
  console.log('KatBot is online');
});

client.on('message', message => {
  CommandSystem.execute(client, message);
});

// CommandSystem.load(() => console.log('Commands loaded'));
CommandSystem.load(function() {
  console.log('Command system loaded.');
});

function setGameMessage(message) {
  if (!message) return;

  client.user.setActivity(message);
}

client.login(process.env.TOKEN);
