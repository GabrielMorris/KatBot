require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();
const random = require('random');
const CommandSystem = require('./command-system')();
const mongoose = require('mongoose');
const RandomEmoji = require('./listeners/random-emoji')();
const LevelSystem = require('./listeners/level-system')();
const DragonSword = require('./listeners/dragon-sword')(client);

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
  setGameMessage('DRAGON SWORD');
  console.log('KatBot is online');
  DragonSword.startGame();
});

client.on('message', message => {
  if (message.author.bot) return;

  // Sends the command to the command system
  CommandSystem.execute(client, message);
  LevelSystem.execute(message);

  const rand = Math.floor(random.float() * 199);

  // If random number <2 send a random Kat emoji
  if (rand < 2) {
    RandomEmoji.execute(client, message);
  }
});

// Sets KatBot's activity
function setGameMessage(message) {
  if (!message) return;

  client.user.setActivity(message);
}
