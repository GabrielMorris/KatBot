const Discord = require('discord.js');
const random = require('random');
const EmbedConsts = require('../constants/embeds');
const LevelConsts = require('../constants/level-consts');

function createEmbed(embedOpts) {
  const { image, fields, title } = embedOpts;

  const embed = new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .setThumbnail(EmbedConsts.images[image]);

  if (title) embed.setTitle(title);

  fields.forEach(field => embed.addField(field.name, field.value));

  return embed;
}

/**
 * Gets object describing user's rank based on their experience count
 * @param {Number} xp User's experience count
 * @returns {Object} Object describing user's rank
 * @example
 * // returns rank object with name 'Cocoa Powder'
 * LevelConsts.ranks = [ {name: '', maxXP: 25}, {name: 'Cocoa Powder', maxXP: 150}, {name: 'Coca Powder ;]', maxXP: 250} ];
 * getUserRank(150);
 */
function getUserRank(xp) {
  return LevelConsts.ranks.find(rank => xp < rank.maxXP);
}

/**
 * Takes monster array and returns random monster
 * @param {Array} monsterArr
 * @returns {Monster} Random Monster object
 * @example
 * // returns random monster object from array of all monsters
 * const allMonsters = [ ... ];
 * randomMonster(allMonsters);
 */
function randomMonster(monsterArr) {
  return monsterArr[Math.floor(random.float() * monsterArr.length)];
}

/**
 * Takes array and returns a valid random index number
 * @param {Array} arr
 * @returns {Number} Valid index number from value of parameter arr
 * @example
 * // returns random number between 0 and 2
 * const arrParam = ['itemA', 'itemB', 'itemC'];
 * randomArrayIndex(arrParam);
 */
function randomArrayIndex(arr) {
  return Math.floor(random.float() * arr.length);
}

/**
 * Capitalizes first letter of given string
 * @param {String} string
 * @returns {String} Capitalized string param
 * @example
 * //returns 'Katbot'
 * capitalizeFirstLetter('katbot');
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  createEmbed,
  getUserRank,
  randomMonster,
  randomArrayIndex,
  capitalizeFirstLetter
};
