const Discord = require('discord.js');
const EmbedConsts = require('../constants/embeds');

// Sets the game state in Mongo
function setGameState(game, bool, monster = null) {
  game.monsterAlive = bool;
  game.monster = monster;

  game.save();
}

// Creates a simple embed with only a single field
function gameEmbed(obj) {
  const { title, text } = obj;

  return new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .addField(title, text);
}

module.exports = { setGameState, gameEmbed };
