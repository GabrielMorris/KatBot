exports.run = (client, message, args) => {
  const Game = require('../models/game/game');

  if (message.author.id === '278301453620084736') {
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
};
