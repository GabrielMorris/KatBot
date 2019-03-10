exports.run = (client, message, args) => {
  const Character = require('../models/game/character');

  const {
    calculateStats,
    getCharacterLevel
  } = require('../utils/character-utils');
  const { restEmbed, cantRestEmbed } = require('../utils/embed-utils');

  const { channel } = message;

  // Can only rest <40% HP
  Character.findOne({ memberID: message.author.id }).then(character => {
    const levelObj = getCharacterLevel(character);
    const baseStats = calculateStats(character, levelObj);

    // If a player's health is 40% or less of the total they can rest
    if (character.health <= 0.4 * baseStats.HP) {
      // Can rest
      const goldCost = Math.floor(character.gold * 0.05);

      character.health = baseStats.HP;
      character.gold = character.gold - goldCost;

      channel.send(restEmbed(message.author.username, goldCost));

      character.save();
    } else {
      // Can't rest
      channel.send(cantRestEmbed(message.author.username));
    }
  });
};
