const levels = require('../../constants/levels');

/**
 * Returns an object with information about a character's level
 * @param {Character} character Character model object to retrieve level information for
 * @returns {Object} Object representing character level information
 */
function getCharacterLevel(character) {
	// cap at max level
	const maxLevel = levels[levels.length - 1];
	if (character.experience >= maxLevel.threshold) {
		return maxLevel;
	}
	// otherwise search through levels table
	return levels.find((level, index) => {
		if (
			character.experience >= level.threshold &&
			character.experience < levels[index + 1].threshold
		) {
			return true;
		}
	});
}

module.exports = {
	getCharacterLevel
};
