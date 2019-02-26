require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const CommandSystem = require('./command-system')();
const mongoose = require('mongoose');
const RandomEmoji = require('./fun/random-emoji')();
const LevelSystem = require('./fun/level-system')();

// Mongo connection
mongoose.connect('mongodb://ds151805.mlab.com:51805/katia_boticata', {
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
  setGameMessage('Appreciating Kat');
  console.log('KatBot is online');
});

client.on('message', message => {
  if (message.author.bot) return;

  // Sends the command to the command system
  CommandSystem.execute(client, message);
  LevelSystem.execute(message);

  const rand = Math.floor(Math.random() * 199);

  // If random number <5 send a random Kat emoji
  if (rand < 2) {
    RandomEmoji.execute(client, message);
  }
});

// Sets KatBot's activity
function setGameMessage(message) {
  if (!message) return;

  client.user.setActivity(message);
}
