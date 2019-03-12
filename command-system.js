const fs = require('fs');

module.exports = function CommandSystem() {
  // Specify the bot command prefix
  const commandPrefix = ',';
  // Initialize an object to hold the list of commands
  var commandTable = {};

  return {
/**
 * Loads all modules from the ./commands directory into command list
 * @param {Function} ready Callback function to execute after loading files
 * @returns {undefined}
 */
    load: function(ready) {
      fs.readdir('./commands', (err, items) => {
        for (let i = 0; i < items.length; i++) {
          const commandName = items[i].replace(/.js$/, '');

          try {
            commandTable[commandName] = require(`./commands/${commandName}.js`);
          } catch (err) {
            console.error(
              `Encountered error trying to require command: ${commandName}.js`
            );
            console.error(err);
          }
        }

        ready();
      });
    },

/**
 * Takes bot client and a message, parses the message for commands, and executes the appropriate command if necessary
 * @param {Discord.Client} client Bot Discord client object
 * @param {Discord.Message} message Discord message object to parse
 * @returns {undefined}
 */
    execute: function(client, message) {
      if (message.author.bot) return;

      if (!message.content.startsWith(commandPrefix)) {
        return;
      }

      const args = message.content
        .slice(commandPrefix.length)
        .trim()
        .split(/ +/g);
      const commandName = args.shift().toLowerCase();
      const commandFunction = commandTable[commandName];

      if (commandFunction) {
        try {
          commandFunction.run(client, message, args);
          console.log(
            `*****Executing ${commandName.toUpperCase()} on ${
              message.guild.name
            } for ${message.author.username} (ID: ${message.author.id})*****`
          );
        } catch (err) {
          console.error(
            `Encountered error trying to execute command: ${commandName}`
          );
          console.error(err);
        }
      } else {
        // console.log(`Command does not exist: ${commandName}\n${commandTable}`)
      }
    }
  };
};
