const Discord = require('discord.js');
const EmbedConsts = require('../constants/embeds');
const levels = require('../constants/levels');
const { capitalizeFirstLetter } = require('../utils/utils');
const { gameEmbedThumbs } = require('../constants/game');
const { getCharacterLevel, calculateStats } = require('./character-utils');
const { calculateFlatHitChance } = require('./combat-utils');

/* === EMBED CLASSES === */
/**
 * Creates simple RichEmbed object with only a single field
 * @param {Object} obj Embed parameter object
 * @param {String} obj.title Embed title
 * @param {String} obj.text Embed text
 * @param {String|null} [thumbnail=null] URL for embed image thumbnail (optional)
 * @returns {Discord.RichEmbed} Discord RichEmbed built with given parameters
 * @example
 * // Creates a simple embed with the title "Sample Game Embed",
 * // the text "This is sample body text for the embed.",
 * // and an image thumbnail with the URL 'https://i.imgur.com/xxxxxx2.png'
 * const opts = {
 *   title: 'Sample Game Embed',
 *   text: 'This is sample body text for the embed.'
 * }
 * gameEmbed(opts, 'https://i.imgur.com/xxxxxx2.png');
 */
function gameEmbed(obj, thumbnail = null) {
  const { title, text } = obj;

  const embed = new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .addField(title, text);

  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

/**
 * Creates an embed for a new game instance
 * @returns {Discord.RichEmbed} Discord RichEmbed with new game instance information
 */
function startGameEmbed() {
  return gameEmbed(
    {
      title: '**DRAGON SWORD**',
      text:
        '_Ruin has come to these lands, once opulent and imperial. First the Fall, then the Taint, and now... this is all that remains; oceans of sun-scorched sand, crooked marshes, the crumbling and decaying husks of bustling towns that bustle no more._\n\n_A half-remembered dream led you to these cursed lands, a dream of the DRAGON SWORD. Shall you be the one to undo what has been done?_'
    },
    gameEmbedThumbs.intro
  );
}

/**
 * Creates an embed for a character sheet
 * @param {Character} character Character model to fill sheet with
 * @param {Object} charClass Character class object to fill sheet with
 * @param {String} username Username to fill on model sheet
 * @returns {Discord.RichEmbed} Discord RichEmbed with character sheet information
 */
function characterSheetEmbed(character, charClass, username) {
  const levelObj = getCharacterLevel(character);
  const nextLevelObj = levels.find(level => level.level > levelObj.level);
  const stats = calculateStats(character, levelObj);
  const hitChance = calculateFlatHitChance(stats);

  return new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .setThumbnail(charClass.thumbnail)
    .addField(
      `**${username.toUpperCase()}**`,
      `**Level**: ${levelObj.level}\n**XP:** ${character.experience}/${
        nextLevelObj.threshold
      }\n**Class:** ${capitalizeFirstLetter(
        charClass.name
      )}\n**Gender:** ${capitalizeFirstLetter(character.pronouns)}`
    )
    .addField(
      '**STATS**',
      `**HP:** ${character.health}/${stats.HP} (${Math.floor(
        (character.health / stats.HP) * 100
      )}%)\n**MP:** ${stats.MP}\n**HIT:** ${hitChance * 100}%\n**STR:** ${
        stats.STR
      }\n**DEF:** ${stats.DEF}\n**AGI:** ${stats.AGI}\n**LUCK:** ${stats.AGI}`
    )
    .addField('**INVENTORY**', `**GOLD:** ${character.gold}g`);
}

/**
 * Creates an embed showing rankings for a given set of characters
 * @param {Array.<Character>} characters Array of character models to fill embed with
 * @returns {Discord.RichEmbed} Discord RichEmbed filled with character ranking information
 */
// TODO: need to make sure we don't exceed 1024 char embed field limit
function guildRankingEmbed(characters) {
  const text = characters
    .map((character, index) => {
      return `${index + 1}. <@${character.memberID}> - **LVL ${
        getCharacterLevel(character).level
      } ${capitalizeFirstLetter(character.class)}** - **${
        character.experience
      }xp**`;
    })
    .join('\n');

  return gameEmbed({
    title: '**Server Rankings**',
    text
  });
}

/**
 * Creates an embed representing a character class
 * @param {Object} charClass Character class object to fill embed with
 * @returns {Discord.RichEmbed} Discord RichEmbed filled with character class information
 */
function classEmbed(charClass) {
  return new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .setThumbnail(charClass.thumbnail)
    .addField(
      `**${capitalizeFirstLetter(charClass.name)}**`,
      `${charClass.description}`
    )
    .addField(
      '**Stats**',
      `HP: ${charClass.base.HP}\nMP: ${charClass.base.MP}\nSTR: ${
        charClass.base.STR
      }\nDEF: ${charClass.base.DEF}\nAGI: ${charClass.base.AGI}\nLUCK: ${
        charClass.base.LUCK
      }`
    );
}

/**
 * Creates an embed displaying character creation help
 * @returns {Discord.RichEmbed} Discord RichEmbed displaying character creation help
 */
function helpEmbed() {
  return new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .setThumbnail(gameEmbedThumbs.help)
    .addField(
      '**Character Creation Help**',
      '`,character help` - displays this message\n`,character list` - lists character classes\n`,character new <class> <pronouns>` - creates new character\n`,character me` - displays your character sheet'
    )
    .addField('**Available pronouns**', 'male, female, neutral');
}

/**
 * Creates an embed that displays a generic "you have no character" message with registration information
 * @returns {Discord.RichEmbed} Discord RichEmbed displaying a generic "you have no character" message
 */
function noCharacterEmbed() {
  return gameEmbed(
    {
      title: '**No character**',
      text:
        'You dont have a character - register with `,character new <className> <pronouns>`'
    },
    gameEmbedThumbs.noChar
  );
}

/**
 * Creates an embed that displays a generic "you already have a character" message
 * @returns {Discord.RichEmbed} Discord RichEmbed displaying a generic "you already have a character" message
 */
function alreadyHasCharacterEmbed() {
  return gameEmbed(
    {
      title: '**Character exists**',
      text: 'You already have a character!'
    },
    gameEmbedThumbs.hasChar
  );
}

/**
 * Creates an embed that displays information and narrative about a newly spawned monster
 * @param {Monster} monster Monster model to fill monster information sheet section with
 * @param {String} intro Intro narrative text to fill narrative section with
 * @returns {Discord.RichEmbed} Discord RichEmbed filled with new monster and narrative information
 */
function monsterEmbed(monster, intro) {
  return new Discord.RichEmbed()
    .setThumbnail(monster.thumbnail)
    .setColor(EmbedConsts.color)
    .addField(
      '**NEW MONSTER**',
      `**${monster.name}** appeared with **${monster.health} HP**`
    )
    .addBlankField()
    .addField('**NARRATIVE**', intro);
}

function levelUpEmbed(currentLevel, newLevel, stats, username) {
  return gameEmbed(
    {
      title: '**LEVEL UP**',
      text: `**${username}'s** level has increased from **${
        currentLevel.level
      }** to **${newLevel.level}**\n\nHP: **${stats.old.HP} -> ${
        stats.new.HP
      }**\nMP: **${stats.old.MP} -> ${stats.new.MP}**\nSTR: **${
        stats.old.STR
      } -> ${stats.new.STR}**\nDEF: **${stats.old.DEF} -> ${
        stats.new.DEF
      }**\nAGI: **${stats.old.AGI} -> ${stats.new.AGI}**\nLUCK: **${
        stats.old.LUCK
      } -> ${stats.new.LUCK}**`
    },
    gameEmbedThumbs.levelUp
  );
}

function combatEmbed(username, monster, damage, thumbnail) {
  const dead = monster.health - damage <= 0 ? true : false;

  const text =
    damage > 0
      ? `**${username}** hit **${monster.name}** for **${damage} HP**, ${
          dead ? 'killing' : 'wounding'
        } it!`
      : `**${username}** missed **${monster.name}**!`;

  return gameEmbed(
    {
      title: '**COMBAT**',
      text
    },
    thumbnail
  );
}

function monsterAttackEmbed(username, character, monster, damage) {
  const dead = character.health - damage <= 0 ? true : false;
  let pronouns;

  if (character.pronouns === 'male') pronouns = 'him';
  else if (character.pronouns === 'female') pronouns = 'her';
  else if (character.pronouns === 'neutral') pronouns = 'them';

  const text = `**${
    monster.name
  }** attacked **${username}** for **${damage} HP**, ${
    dead ? 'mortally wounding' : 'wounding'
  } ${pronouns}!`;

  return gameEmbed(
    {
      title: '**MONSTER ATTACK**',
      text
    },
    monster.thumbnail
  );
}

function combatRewardEmbed(username, xp, goldEarned) {
  return gameEmbed(
    {
      title: '**REWARDS**',
      text: `**${username}** gained **${xp}xp** and earned **${goldEarned} gold**!`
    },
    gameEmbedThumbs.xp
  );
}

function combatOutroEmbed(monster) {
  return gameEmbed(
    {
      title: '**NARRATIVE**',
      text: `_${monster.outro}_`
    },
    gameEmbedThumbs.combatOut
  );
}

function monsterFailFleeEmbed(name, thumbnail) {
  return gameEmbed(
    {
      title: '**Monster fails to flee**',
      text: `_The ${name} glances away from you, as if vying to escape..._`
    },
    thumbnail
  );
}

function monsterFleeSuccessEmbed(name, thumbnail) {
  return gameEmbed(
    {
      title: '**Monster flees**',
      text: `_The ${name} flees the field of battle as quickly as it came_`
    },
    thumbnail
  );
}

function mustRestEmbed(username) {
  return gameEmbed(
    {
      title: '**MORTAL WOUND**',
      text: `**${username}** is mortally wounded and must \`,rest\` before returning to the fight`
    },
    EmbedConsts.images.rest
  );
}

function restEmbed(username, goldCost) {
  return gameEmbed(
    {
      title: '**REST**',
      text: `_**${username}** lays down their burdens and rests at a local inn for **${goldCost}g**, restoring their health_`
    },
    EmbedConsts.images.rest
  );
}

function cantRestEmbed(username) {
  return gameEmbed(
    {
      title: "**CAN'T REST**",
      text: `**${username}'s** health is over 40% and cannot rest!`
    },
    EmbedConsts.images.rest
  );
}

module.exports = {
  gameEmbed,
  startGameEmbed,
  characterSheetEmbed,
  guildRankingEmbed,
  classEmbed,
  helpEmbed,
  noCharacterEmbed,
  alreadyHasCharacterEmbed,
  monsterEmbed,
  levelUpEmbed,
  combatEmbed,
  combatRewardEmbed,
  combatOutroEmbed,
  monsterFailFleeEmbed,
  monsterFleeSuccessEmbed,
  mustRestEmbed,
  monsterAttackEmbed,
  restEmbed,
  cantRestEmbed
};
