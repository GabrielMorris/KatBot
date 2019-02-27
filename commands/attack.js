exports.run = (client, message, args) => {
  const Game = require('../models/game/game');
  // If monster is alive
  Game.findOne({ guildID: message.guild.id }).then(game => {
    console.log(game);
  });
  // Attack monster
  // Kill monster in DB
  // Reward XP
};
