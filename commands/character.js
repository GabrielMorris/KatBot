exports.run = (client, message, args) => {
  const Discord = require('discord.js');
  const EmbedConsts = require('../constants/embeds');
  const Classes = require('../constants/character-classes');
  const Character = require('../models/game/character');
  const pronouns = require('../constants/pronouns');
  const { gameChannels } = require('../constants/game');

  // Sends help to the channel
  if (args.includes('help')) {
    const embed = new Discord.RichEmbed()
      .setColor(EmbedConsts.color)
      .addField(
        '**Character Creation Help**',
        '`,character help` - displays this message\n`,character list` - lists character classes\n`,character new <class> <pronouns>` - creates new character\n`,character me` - displays your character sheet'
      )
      .addField('**Available pronouns**', 'male, female, neutral');

    message.channel.send({ embed });

    return;
  }

  // Sends the character list to the channel
  if (args.includes('list')) {
    // If we arent in a game channel dont spam the chat with the list
    if (!gameChannels.find(channel => channel === message.channel.id)) {
      return;
    }

    // For every class we will want to create an embed with the class information
    Classes.forEach(charClass => {
      const embed = new Discord.RichEmbed()
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

      message.channel.send({ embed });
    });

    return;
  }

  // Create a new character
  if (args.includes('new')) {
    // [new, class, pronouns]
    const classNames = [];

    // Get all of the string representations of class names and put them in an array
    Classes.forEach(charClass => classNames.push(charClass.name));

    // If new is an arg but not in the right spot don't do anything
    if (args[0] !== 'new') {
      return;
    } else if (!classNames.find(name => name === args[1].toLowerCase())) {
      // If the class name isn't found send a message saying the class name is not valid
      message.channel.send('Bad class name');

      return;
    } else if (!pronouns.find(pronoun => pronoun === args[2].toLowerCase())) {
      // If the pronouns arent in the pronoun consts file send a message saying that
      message.channel.send('Bad pronouns');

      return;
    }

    // Get the class from the class constants and the pronouns the user wants for their character
    const charClass = Classes.find(char => char.name === args[1]);
    const pronoun = args[2];

    // Check to see if a user already has a character
    Character.findOne({
      memberID: message.author.id,
      guildID: message.guild.id
    }).then(mongoChar => {
      if (mongoChar) {
        // If they've already got a character don't do anything and send a message to the channel saying that
        message.channel.send('You already have a character!');
      } else {
        // Otherwise create a new mongo doc for the character
        Character.create({
          guildID: message.guild.id,
          memberID: message.author.id,
          class: charClass.name,
          experience: 0,
          health: charClass.base.HP,
          mana: charClass.base.MP,
          str: charClass.base.STR,
          def: charClass.base.DEF,
          agi: charClass.base.AGI,
          luck: charClass.base.LUCK,
          pronouns: pronoun
        })
          .then(character => {
            // And then after the character is created send an embed with the character sheet to the channel
            const embed = new Discord.RichEmbed()
              .setColor(EmbedConsts.color)
              .setThumbnail(charClass.thumbnail)
              .addField(
                `**${message.author.username}**`,
                `XP: ${character.experience}\nHP: ${character.health}\nMP: ${
                  character.mana
                }\nSTR: ${character.str}\nDEF: ${character.def}\nAGI: ${
                  character.agi
                }\nLUCK: ${character.luck}`
              );

            message.channel.send({ embed });
          })
          .catch(err => console.error(err));
      }
    });

    return;
  }

  // Display your character sheet
  if (args.includes('me')) {
    // Check to see if you have a character
    Character.findOne({
      guildID: message.guild.id,
      memberID: message.author.id
    }).then(character => {
      // If the user doesnt have a character send a message saying that
      if (!character) {
        message.channel.send('You dont have a character');

        return;
      } else {
        // Otherwise find the character's class in the constants
        const charClass = Classes.find(
          charClass => charClass.name === character.class
        );

        // And send an embed with the character's character sheet
        const embed = new Discord.RichEmbed()
          .setColor(EmbedConsts.color)
          .setThumbnail(charClass.thumbnail)
          .addField(
            `**${message.author.username} - ${capitalizeFirstLetter(
              character.pronouns
            )}**`,
            `XP: ${character.experience}\nHP: ${character.health}\nMP: ${
              character.mana
            }\nSTR: ${character.str}\nDEF: ${character.def}\nAGI: ${
              character.agi
            }\nLUCK: ${character.luck}`
          );

        message.channel.send({ embed });

        return;
      }
    });
  }
};

// TODO: move this utility function to a util module so we can use it elsewhere
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
