const stateUtils = require('../utils/state-utils.js');

exports.run = (client, message, args) => {
  const { createEmbed } = require('../utils/utils');
  const botName = stateUtils.getBotName();

  const embedOpts = {
    image: 'help',
    title: `**${botName} Commands**`,
    fields: [
      {
	      name: '**,attack**',
	      value: 'Attack the current monster in this server. If no monster is currently around, nothing happens.'
      },
      {
	      name: '**,character [list|me|new|top]**',
	      value: '`list`: show character classes. `me`: show your character sheet for this server. `new`: create new character. `top`: show server character rankings.'
      },
      { name: '**,debug-game**', value: 'Show game debug information (restricted).' },
      { name: '**,help**', value: 'Display this message with command help.' },
      { name: '**,pong**', value: 'Display ping.' },
      {
        name: '**,rank <@user1, @users2?, ... || ranks>**',
        value:
          'Provides current guild level and rank information for user(s). If no arguments provided this will provide your rank or up to three users may be mentioned to get their ranking information. Alternatively `,rank ranks` will show all available ranks.'
      },
      { name: '**,rest**', value: 'Rest your character to restore their HP (costs gold). Will not work if you are already healthy.' },
      {
        name: '**,top**',
        value:
          'Displays the top 10 users on the server based on experience sorted in descending order.'
      }
    ]
  };

  message.channel.send(createEmbed(embedOpts)).catch(err => console.error(err));
};
