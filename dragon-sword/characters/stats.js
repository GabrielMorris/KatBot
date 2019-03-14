// utils
const characterUtils = require('../../utils/character-utils');

/**
 * Gets a character's stats as an object
 * @param {Character} character Character to retrieve stats from
 * @returns {Object}
 */
function getCharacterStats(character) {
	return characterUtils.calculateStats(
	character,
	characterUtils.getCharacterLevel(character)
	);
}

module.exports = {
	getCharacterStats
};
