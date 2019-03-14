// utils
const levels = require('./levels');
const classes = require('../../constants/character-classes');

/**
 * Creates an object representing a character's stats at a given level
 * @private
 * @param {Character} character Character model object to generate stats from
 * @param {Object} levelObj Object with character level information
 * @returns {Object} Object containing stat information
 */
function calculateStats(character, levelObj) {
  // Get the character's class
  const charClass = classes.find(
    charClass => charClass.name === character.class
  );
  // Deconstruct the level number and base and growth stats for the class
  const { level } = levelObj;
  const { base, growth } = charClass;

  // Return the stats modified for level
  return {
    HP: base.HP + growth.HP * level,
    MP: base.MP + growth.MP * level,
    STR: base.STR + growth.STR * level,
    DEF: base.DEF + growth.DEF * level,
    AGI: base.AGI + growth.AGI * level,
    LUCK: base.LUCK + growth.LUCK * level
  };
}

/**
 * Gets a character's stats as an object
 * @param {Character} character Character to retrieve stats from
 * @returns {Object}
 */
function getCharacterStats(character) {
	return calculateStats(
	character,
	levels.getCharacterLevel(character)
	);
}

module.exports = {
	getCharacterStats
};
