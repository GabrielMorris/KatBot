exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const Character = require('../models/game/character');

  const {
    setGameState,
    getCharacterLevel,
    handleLevelUp,
    levelUpEmbed,
    combatRewardEmbed,
    combatOutroEmbed,
    combatEmbed,
    noCharacterEmbed,
    getCharacterClass,
    calculateStats,
    calculateGoldGain
  } = require('../utils/game-utils');

  const { channel, guild, author } = message;

  // If monster is alive
  Game.findOne({ guildID: guild.id }).then(game => {
    if (game && game.monsterAlive) {
      const { monster } = game;
      const monsterBaseHealth = game.monster.health;
      const goldEarned = calculateGoldGain(monsterBaseHealth);

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

            const stats = calculateStats(
              character,
              getCharacterLevel(character)
            );
            const combinedStats = stats.STR + stats.AGI;
            const damage = Math.ceil(combinedStats * 0.1);

            // Attack monster
            channel.send(
              combatEmbed(author.username, monster, damage, charClass.thumbnail)
            );

            if (game.monster.health - damage <= 0) {
              // Get the character's current level
              const currentLevel = getCharacterLevel(character);

              // Reward XP
              character.experience += monster.xpValue;

              // Reward gold
              character.gold += goldEarned;

              // Get the level again
              const newLevel = getCharacterLevel(character);

              // If the levels are different they've leveled up
              if (currentLevel.level !== newLevel.level) {
                // Get the old/new stats object and level up the character
                const stats = handleLevelUp(character, currentLevel, newLevel);

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
            } else {
              game.monster.health -= damage;

              // Manually set the monster object as modified, as mongoose doesn't detect nested obect updatesL
              game.markModified('monster');
              game.save();

              return false;
            }
          }
        })
        .then(hasChar => {
          if (!hasChar) return hasChar;

          channel.send(combatOutroEmbed(monster));

          return true;
        })
        .then(hasChar => {
          if (!hasChar) return hasChar;

          channel.send(
            combatRewardEmbed(author.username, monster.xpValue, goldEarned)
          );

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
