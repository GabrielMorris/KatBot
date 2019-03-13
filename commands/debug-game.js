const stateUtils = require('../utils/state-utils');

exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const gameMasters = stateUtils.getGameMasters();

  if (gameMasters.includes(message.author.id)) {
    Game.findOne({ guildID: message.guild.id }).then(gameDoc => {
      console.log(gameDoc);

      message.channel.send(
        `Guild: ${gameDoc.guildID}\nAlive: ${gameDoc.monsterAlive}\nMonster:${
          gameDoc.monster
            ? `${gameDoc.monster.name}\nHealth: ${
                gameDoc.monster.health
              }\nXP value:${gameDoc.monster.xpValue}`
            : null
        }`
      );
    });
  }
  else {
	  message.channel.send('You do not have permission to use this command.');
  }
};
