require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const CommandSystem = require('./command-system')();
const mongoose = require('mongoose');
const LevelSystem = require('./listeners/level-system')();
const DragonSword = require('./listeners/dragon-sword')(client);

// Mongo connection
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});

const db = mongoose.connection;

// Database listeners
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log('Database connection established');

  CommandSystem.load(() => {
    console.log('Command system loaded');

    client.login(process.env.TOKEN);
  });
});

// Client listeners
client.on('ready', () => {
  setGameMessage('DRAGON SWORD');
  console.log('KatBot is online');
  DragonSword.startGame();
});

client.on('message', message => {
  if (message.author.bot) return;

  // Sends the command to the command system
  CommandSystem.execute(client, message);
  LevelSystem.execute(message);
});

/**
 * Sets this bot's activity status
 * @param {String} message Text to set bot's Discord client status to
 * @returns {undefined}
 */
function setGameMessage(message) {
  if (!message) return;

  client.user.setActivity(message);
}
