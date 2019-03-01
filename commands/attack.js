exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const Character = require('../models/game/character');

  const {
    setGameState,
    getCharacterLevel,
    handleLevelUp,
    levelUpEmbed,
    xpEmbed,
    combatOutroEmbed,
    combatEmbed,
    noCharacterEmbed,
    getCharacterClass
  } = require('../utils/game-utils');

  const { channel, guild, author } = message;

  // If monster is alive
  Game.findOne({ guildID: guild.id }).then(game => {
    if (game && game.monsterAlive) {
      const { monster } = game;

      // See if we have a character on this guild
      Character.findOne({
        guildID: guild.id,
        memberID: author.id
      })
        .then(character => {
          // If we have no character send a message explaining how to register
          if (!character) {
            channel.send(noCharacterEmbed());

            // Return false so the next then statements dont execute
            return false;
          } else {
            const charClass = getCharacterClass(character);

            // Attack monster
            channel.send(
              combatEmbed(author.username, monster, charClass.thumbnail)
            );

            // Get the character's current level
            const currentLevel = getCharacterLevel(character);

            // Reward XP
            character.experience += monster.xpValue;

            // Get the level again
            const newLevel = getCharacterLevel(character);

            // If the levels are different they've leveled up
            if (currentLevel.level !== newLevel.level) {
              // Get the old/new stats object and level up the character
              const stats = handleLevelUp(character);

              // Create and send the level up embed
              const lvlUpEmbed = levelUpEmbed(
                currentLevel,
                newLevel,
                stats,
                author.username
              );

              channel.send(lvlUpEmbed);
            }

            // Save the changes to the MongoDoc
            character.save();

            // Return true so the then statements will execute
            return true;
          }
        })
        .then(hasChar => {
          if (!hasChar) return hasChar;

          channel.send(combatOutroEmbed(monster));

          return true;
        })
        .then(hasChar => {
          if (!hasChar) return hasChar;

          channel.send(xpEmbed(author.username, monster.xpValue));

          return true;
        })
        .then(hasChar => {
          if (!hasChar) return;

          setGameState(game, false);
        });
    } else {
      channel.send('There is no monster!');
    }
  });
};
