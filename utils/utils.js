const Discord = require('discord.js');
const random = require('random');
const EmbedConsts = require('../constants/embeds');
const LevelConsts = require('../constants/level-consts');

/**
 * Creates and returns a Discord.RichEmbed object based on options parameter
 * @param {Object} embedOpts
 * @param {} embedOpts.image
 * @param {} embedOpts.fields
 * @param {} embedOpts.title
 * @returns {Discord.RichEmbed} Discord.RichEmbed object constructed from given options
 * @example
 * // Returns a Discord.RichEmbed object with the title "A Sample Rich Embed",
 * // two fields with name/value pairs "First Field":"Text for field one." and "Second Field":"Text for field two.",
 * // and an image thumbnail with the URL 'https://i.imgur.com/xxxxxx2.png'
 * EmbedConsts.images = {
 *   top: 'https://i.imgur.com/xxxxxx0.png',
 *   rank: 'https://i.imgur.com/xxxxxx1.png',
 *   help: 'https://i.imgur.com/xxxxxx2.png',
 *   memes: 'https://i.imgur.com/xxxxxx3.png',
 *   rest: 'https://i.imgur.com/xxxxxx4.png'
 * }
 * const options = {
 *   image: 'help',
 *   fields: [
 *     {name: 'First Field', value: 'Text for field one'},
 *     {name: 'Second Field', value: 'Text for field two'}
 *   ],
 *   title: 'A Sample Rich Embed'
 * }
 * createEmbed(options);
 */
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
