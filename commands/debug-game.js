const { spawner } = require('../dragon-sword/spawner');
const stateUtils = require('../utils/state-utils');

exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  const gameMasters = stateUtils.getGameMasters();

  if (gameMasters.includes(message.author.id)) {
    Game.findOne({ guildID: message.guild.id }).then(gameDoc => {
      console.log(gameDoc);

      console.log('debug args:');
      console.dir(args);
      // Spawns a random monster in the channel
      if (args.includes('monsterspawn')) {
        console.log('running monster spawner');
        spawner(message.channel);
        return;
      }

      console.log('sending debug info');
      message.channel.send(
        `Guild: ${gameDoc.guildID}\nAlive: ${gameDoc.monsterAlive}\nMonster:${
          gameDoc.monster
            ? `${gameDoc.monster.name}\nHealth: ${
                gameDoc.monster.healthCurrent
              }/${gameDoc.monster.health}\nXP value:${gameDoc.monster.xpValue}`
            : null
        }`
      );
    });
  } else {
    message.channel.send('You do not have permission to use this command.');
  }
};
