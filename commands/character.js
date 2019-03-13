const stateUtils = require('../utils/state-utils');

exports.run = (client, message, args) => {
  const classes = require('../constants/character-classes');
  const Character = require('../models/game/character');
  const pronouns = require('../constants/pronouns');
  const gameChannels = stateUtils.getGameChannels();
  const {
    characterSheetEmbed,
    classEmbed,
    alreadyHasCharacterEmbed,
    guildRankingEmbed,
    helpEmbed
  } = require('../utils/embed-utils');

  // TODO: move/remove these
  const {
    calculateStats,
    getCharacterLevel
  } = require('../utils/character-utils');

  const { channel } = message;

  // Sends help to the channel
  if (args.includes('help')) {
    channel.send(helpEmbed());

    return;
  }

  // Sends the character list to the channel
  if (args.includes('list')) {
    // If we arent in a game channel dont spam the chat with the list
    if (!gameChannels.find(chan => chan === channel.id)) {
      return;
    }

    // For every class we will want to create an embed with the class information
    classes.forEach(charClass => channel.send(classEmbed(charClass)));

    return;
  }

  // Create a new character
  if (args.includes('new')) {
    // [new, class, pronouns]
    const classNames = [];

    // Get all of the string representations of class names and put them in an array
    classes.forEach(charClass => classNames.push(charClass.name));

    // If new is an arg but not in the right spot don't do anything
    if (args[0] !== 'new') {
      return;
    }
    else if (!args[1]) {
	    channel.send('Please specify a valid class name.');
    } else if (!classNames.find(name => name === args[1].toLowerCase())) {
      // If the class name isn't found send a message saying the class name is not valid
      channel.send('Invalid class name');

      return;
    }
    else if (!args[2]) {
	    channel.send('Please specify a set of pronouns.');
    } else if (!pronouns.find(pronoun => pronoun === args[2].toLowerCase())) {
      // If the pronouns arent in the pronoun consts file send a message saying that
      channel.send('Invalid pronouns (male, female, or neutral)');

      return;
    }

    // Get the class from the class constants and the pronouns the user wants for their character
    const charClass = classes.find(char => char.name === args[1].toLowerCase());
    const pronoun = args[2].toLowerCase();

    // Check to see if a user already has a character
    Character.findOne({
      memberID: message.author.id,
      guildID: message.guild.id
    }).then(mongoChar => {
      if (mongoChar) {
        // If they've already got a character don't do anything and send a message to the channel saying that
        channel.send(alreadyHasCharacterEmbed());
      } else {
        // Otherwise create a new mongo doc for the character
        Character.create({
          guildID: message.guild.id,
          memberID: message.author.id,
          class: charClass.name,
          experience: 0,
          health: charClass.base.HP,
          mana: charClass.base.MP,
          pronouns: pronoun,
          gold: 0
        })
          .then(character => {
            // And then after the character is created send an embed with the character sheet to the channel
            const charEmbed = characterSheetEmbed(
              character,
              charClass,
              message.author.username
            );

            channel.send(charEmbed);
          })
          .catch(err => console.error(err));
      }
    });

    return;
  }

  // Display your character sheet
  if (args.includes('me')) {
    // TODO: Remove this or move to util, resets hp for everyone
    // Character.find().then(chars => {
    //   chars.forEach(char => {
    //     const levelObj = getCharacterLevel(char);
    //     const stats = calculateStats(char, levelObj);

    //     console.log(stats);
    //     char.health = stats.HP;
    //     char.save();
    //   });
    // });
    // Check to see if you have a character
    Character.findOne({
      guildID: message.guild.id,
      memberID: message.author.id
    }).then(character => {
      // If the user doesnt have a character send a message saying that
      if (!character) {
        channel.send('You dont have a character');

        return;
      } else {
        // Otherwise find the character's class in the constants
        const charClass = classes.find(
          charClass => charClass.name === character.class
        );

        // And send an embed with the character's character sheet
        const embed = characterSheetEmbed(
          character,
          charClass,
          message.author.username
        );

        channel.send({ embed });

        return;
      }
    });
  }

  // Displays server rankings
  if (args.includes('top')) {
    Character.find({ guildID: message.guild.id })
      .sort({ experience: -1 })
      .then(characters => {
        const rankingEmbed = guildRankingEmbed(characters);

        channel.send(rankingEmbed);
      });
  }
};
