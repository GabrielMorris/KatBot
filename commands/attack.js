// models
const Game = require('../models/game/game');
const Character = require('../models/game/character');

const damageCalculator = require('../dragon-sword/combat/damage-calculator');
const accuracyCalculator = require('../dragon-sword/combat/accuracy-calculator');
const rewards = require('../dragon-sword/combat/rewards');
const levels = require('../dragon-sword/characters/levels');

// utils
const stateUtils = require('../utils/state-utils');
const characterUtils = require('../utils/character-utils');
const embedUtils = require('../utils/embed-utils');
const rngUtils = require('../utils/rng-utils');

/**
 * Check whether a character must rest in order to fight
 * @param {Character} checkCharacter Character to check status of
 * @returns {Boolean} true if character must rest to fight further, false if character can fight without resting
 */
function checkCombatCharacterMustRest(checkCharacter) {
  return checkCharacter.health === 0 ? true : false;
}

/**
 * Check whether a monster is dead
 * @param {Monster} checkMonster Monster to check status of
 * @returns {Boolean} true if monster is dead, false if monster is alive
 */
function checkMonsterDead(checkMonster) {
  return checkMonster.healthCurrent <= 0 ? true : false;
}

/**
 * Damage a monster via a character attack
 * @param {Character} attackingCharacter Character model attacking the monster
 * @param {Monster} targetMonster Monster model being attacked
 * @returns {{hit: Boolean, damageRoll: Number}} Object containing information about the attack
 */
function combatCharacterAttackMonster(attackingCharacter, targetMonster) {
    const hitsEnemy = accuracyCalculator.rollCharacterHitMonster(
      attackingCharacter
    );
    const characterDamageRoll = damageCalculator.rollCharacterDamageMonster(
      attackingCharacter
    );

    if (hitsEnemy) {
	targetMonster.healthCurrent -= characterDamageRoll;
    }

    return {
	    hit: hitsEnemy,
	    damageRoll: characterDamageRoll
    }
}

/**
 * Damage a character via a monster attack
 * @param {Monster} attackingMonster Monster model attacking the character
 * @param {Character} targetCharacter Character model being attacked
 * @returns {Number} Number representing amount of damage done to character
 */
function combatMonsterAttackCharacter(attackingMonster, targetCharacter) {
  // Don't let damage take a character into negative HP
  const monsterDamageRoll = damageCalculator.rollMonsterDamageCharacter(
    attackingMonster
  );
  const cappedMonsterDamage =
    targetCharacter.health - monsterDamageRoll < 0
      ? targetCharacter.health
      : monsterDamageRoll;

  // Damage character
  targetCharacter.health -= cappedMonsterDamage;

  return cappedMonsterDamage;
}

exports.run = (client, message, args) => {
  const { channel, guild, author } = message;

  // If monster is alive
  Game.findOne({ guildID: guild.id }).then(game => {
    if (game && game.monsterAlive) {
      const { monster } = game;
      const monsterBaseHealth = game.monster.health;
      const monsterCurrentHealth = game.monster.healthCurrent;

      // See if we have a character on this guild
      Character.findOne({
        guildID: guild.id,
        memberID: author.id
      })
        .then(character => {
          // If we have no character send a message explaining how to register and exit step
          if (!character) {
            channel.send(embedUtils.noCharacterEmbed());

            return false;
          }
          // If character's got no HP send a must rest embed and exit step
          else if (checkCombatCharacterMustRest(character)) {
            channel.send(embedUtils.mustRestEmbed(author.username));

            return false;
          }
          // execute attack
          else {
            const charClass = characterUtils.getCharacterClass(character);

	    // == attack here
	    const characterAttack = combatCharacterAttackMonster(character, game.monster);


            // Attack monster message
            channel.send(
              embedUtils.combatEmbed(
                author.username,
                monster,
                characterAttack.hit ? characterAttack.damageRoll : 0,
                charClass.thumbnail
              )
            );

            // If we hit the enemy and monster health is <= 0
            if (
              characterAttack.hit &&
              checkMonsterDead(game.monster)
            ) {
              // Get the character's current level
              const currentLevel = levels.getCharacterLevel(character);

              // Grant rewards post-combat
              const combatRewardsEarned = rewards.rewardCharacterCombat(
                character,
                monster
              );

              // Get the level again
              const newLevel = levels.getCharacterLevel(character);

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
              return { goldEarned: combatRewardsEarned.gold };
            } else {
              // If player did no damage return so we don't make an extra DB query
              if (!characterAttack.hit || characterAttack.damageRoll === 0) return false;

              // TODO: move this logic to a util
              const dieRoll = rngUtils.rollInt(1);

              // If roll was less than 0.2 monster will attack
              if (dieRoll < 1) {
                const monsterDamageDealt = combatMonsterAttackCharacter(
                  game.monster,
                  character
                );

                channel.send(
                  embedUtils.monsterAttackEmbed(
                    author.username,
                    character,
                    game.monster,
                    monsterDamageDealt
                  )
                );

                if (character.health === 0) {
                  channel.send(embedUtils.mustRestEmbed(author.username));
                }

                character.save();
              }

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
