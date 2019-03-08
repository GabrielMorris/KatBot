const Discord = require('discord.js');
const EmbedConsts = require('../constants/embeds');
const levels = require('../constants/levels');
const { capitalizeFirstLetter } = require('../utils/utils');
const { gameEmbedThumbs } = require('../constants/game');
const { getCharacterLevel, calculateStats } = require('./character-utils');

/* === EMBED CLASSES === */
// Creates a simple embed with only a single field
function gameEmbed(obj, thumbnail = null) {
  const { title, text } = obj;

  const embed = new Discord.RichEmbed()
    .setColor(EmbedConsts.color)
    .addField(title, text);

  if (thumbnail) embed.setThumbnail(thumbnail);

  return embed;
}

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

function characterSheetEmbed(character, charClass, username) {
  const levelObj = getCharacterLevel(character);
  const nextLevelObj = levels.find(level => level.level > levelObj.level);
  const stats = calculateStats(character, levelObj);

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
      `**HP:** ${stats.HP}\n**MP:** ${stats.MP}\n**STR:** ${
        stats.STR
      }\n**DEF:** ${stats.DEF}\n**AGI:** ${stats.AGI}\n**LUCK:** ${stats.AGI}`
    )
    .addField('**INVENTORY**', `**GOLD:** ${character.gold}g`);
}

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

function alreadyHasCharacterEmbed() {
  return gameEmbed(
    {
      title: '**Character exists**',
      text: 'You already have a character!'
    },
    gameEmbedThumbs.hasChar
  );
}

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

  return gameEmbed(
    {
      title: '**COMBAT**',
      text: `**${username}** hit **${monster.name}** for **${damage} HP**, ${
        dead ? 'killing' : 'wounding'
      } it!`
    },
    thumbnail
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
  monsterFleeSuccessEmbed
};
