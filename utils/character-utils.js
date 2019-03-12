const random = require('random');

const levels = require('../constants/levels');
const classes = require('../constants/character-classes');
const { goldMultipliers } = require('../constants/game');

/* === CHARACTER === */
/**
 * Returns an object with information about a character's level
 * @param {Character} Character model object to retrieve level information for
 * @returns {Object} Object representing character level information
 */
function getCharacterLevel(character) {
  return levels.find((level, index) => {
    if (
      character.experience >= level.threshold &&
      character.experience < levels[index + 1].threshold
    ) {
      return true;
    }
  });
}

/**
 * Returns an object containing old and new stat information based on given character and level information
 * @param {Character} character Character model object to calculate stat information for
 * @param {Object} oldLevel Level object representing old level
 * @param {Object} newLevel Level object representing new level
 * @returns {Object}
 * @returns {Object.old} Object containing old stat information
 * @returns {Object.new} Object containing new stat information
 */
function handleLevelUp(character, oldLevel, newLevel) {
  // Calculate the stats for the old and new levels
  const oldStats = calculateStats(character, oldLevel);
  const newStats = calculateStats(character, newLevel);

  // Create a stat object with the old and new stats and return it
  const statObj = {
    old: oldStats,
    new: newStats
  };

  return statObj;
}

function getCharacterClass(character) {
  const charClass = classes.find(
    charClass => charClass.name === character.class
  );

  if (!charClass) {
    throw new Error('No character class found');
  }

  return charClass;
}

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

function calculateGoldGain(stats, monsterBaseHP) {
  // Calculate gold and luck bonus
  const multiplierGold = goldMultipliers.baseGoldMult * monsterBaseHP;
  const luckBonus = stats.LUCK / 4;

  const randomBonus = Math.ceil(random.float() * (multiplierGold + luckBonus));
  const shouldGiveRandom = random.int(0, 1) === 1 ? true : false;

  let goldEarned = Math.ceil(multiplierGold);

  if (shouldGiveRandom) {
    goldEarned += randomBonus;
  }

  return goldEarned;
}

module.exports = {
  getCharacterLevel,
  handleLevelUp,
  getCharacterClass,
  calculateGoldGain,
  calculateStats
};
