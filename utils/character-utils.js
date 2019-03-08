const levels = require('../constants/levels');
const classes = require('../constants/character-classes');
const { goldMultipliers } = require('../constants/game');

/* === CHARACTER === */
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

  const randomBonus = Math.ceil(Math.random() * (multiplierGold + luckBonus));

  const randomAwarded = Math.floor(Math.random() * 2);
  const shouldGiveRandom = randomAwarded === 1 ? true : false;

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
