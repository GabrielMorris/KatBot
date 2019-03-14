// libraries etc.
const random = require('random');

// models
const Game = require('../models/game/game');
const Character = require('../models/game/character');

const damageCalculator = require('../dragon-sword/combat/damage-calculator');
const accuracyCalculator = require('../dragon-sword/combat/accuracy-calculator');
const rewards = require('../dragon-sword/combat/rewards');
const statTool = require('../dragon-sword/characters/stats');

// utils
const stateUtils = require('../utils/state-utils');
const characterUtils = require('../utils/character-utils');
const embedUtils = require('../utils/embed-utils');

exports.run = (client, message, args) => {
  const { channel, guild, author } = message;

  // If monster is alive
  Game.findOne({ guildID: guild.id }).then(game => {
    if (game && game.monsterAlive) {
      const { monster } = game;
      const monsterBaseHealth = game.monster.health;

      // See if we have a character on this guild
      Character.findOne({
        guildID: guild.id,
        memberID: author.id
      })
        .then(character => {
          // If we have no character send a message explaining how to register
          if (!character) {
            channel.send(embedUtils.noCharacterEmbed());

            // Return false so the next then statements dont execute
            return false;
          } else if (character.health === 0) {
            // If character's got no HP send a must rest embed
            channel.send(embedUtils.mustRestEmbed(author.username));

            return false;
          } else {
            const charClass = characterUtils.getCharacterClass(character);

            // == calculations begin here ==
            const hitsEnemy = accuracyCalculator.rollCharacterHitMonster(
              character
            );
            const characterDamageRoll = damageCalculator.rollCharacterDamageMonster(
              character
            );
            // == calculations end here ==

            // Attack monster
            channel.send(
              embedUtils.combatEmbed(
                author.username,
                monster,
                hitsEnemy ? characterDamageRoll : 0,
                charClass.thumbnail
              )
            );

            // If we hit the enemy and monster health is <= 0
            if (hitsEnemy && game.monster.health - characterDamageRoll <= 0) {
              // Get the character's current level
              const currentLevel = characterUtils.getCharacterLevel(character);

              // Reward XP
              character.experience += monster.xpValue;

              // Reward gold
              const goldEarned = rewards.calculateCharacterRewardGold(
                character,
                game.monster
              );
              character.gold += goldEarned;

              // Get the level again
              const newLevel = characterUtils.getCharacterLevel(character);

              // If the levels are different they've leveled up
              if (currentLevel.level !== newLevel.level) {
                // Get the old/new stats object and level up the character
                const stats = characterUtils.handleLevelUp(
                  character,
                  currentLevel,
                  newLevel
                );

                // Create and send the level up embed
                const lvlUpEmbed = embedUtils.levelUpEmbed(
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
              return { goldEarned: goldEarned };
            } else {
              // If player did no damage return so we don't make an extra DB query
              if (!hitsEnemy || characterDamageRoll === 0) return false;

              // TODO: move this logic to a util
              const dieRoll = random.float();

              // If roll was less than 0.2 monster will attack
              if (dieRoll < 1) {
                // Don't let damage take a character into negative HP
                const monsterDamageRoll = damageCalculator.rollMonsterDamageCharacter(
                  game.monster
                );
                const cappedMonsterDamage =
                  character.health - monsterDamageRoll < 0
                    ? character.health
                    : monsterDamageRoll;

                character.health -= cappedMonsterDamage;

                channel.send(
                  embedUtils.monsterAttackEmbed(
                    author.username,
                    character,
                    game.monster,
                    characterDamageRoll
                  )
                );

                if (character.health === 0) {
                  channel.send(embedUtils.mustRestEmbed(author.username));
                }

                character.save();
              }

              game.monster.health -= characterDamageRoll;

              // Manually set the monster object as modified, as mongoose doesn't detect nested obect updatesL
              game.markModified('monster');
              game.save();

              return false;
            }
          }
        })
        .then(hasCharObj => {
          if (!hasCharObj) return hasCharObj;

          channel.send(embedUtils.combatOutroEmbed(monster));

          return hasCharObj.goldEarned;
        })
        .then(goldEarned => {
          if (!goldEarned) return goldEarned;

          channel.send(
            embedUtils.combatRewardEmbed(
              author.username,
              monster.xpValue,
              goldEarned
            )
          );

          return true;
        })
        .then(hasChar => {
          if (!hasChar) return;

          stateUtils.setGameState(game, false);
        });
    } else {
      channel.send('There is no monster!');
    }
  });
};
