const { randomArrayIndex } = require('../utils/utils');
const { setGameState } = require('./state-utils');
const {
  monsterFailFleeEmbed,
  monsterFleeSuccessEmbed
} = require('./embed-utils');
const Encounter = require('../models/game/encounter');

/**
 * Construct encounter narrative text based on a given monster
 * @param {Monster} monster Monster model to base message information from
 * @returns {Promise<String|undefined>} Promise resolving to encounter text string if fulfilled or rejecting undefined on error
 */
/* === MONSTER NARRATIVE === */
function monsterIntro(monster) {
  // Find a random encounter document
  return Encounter.find()
    .then(encounters => {
      // Replace the monster and description in the encounter doc with the monster name and description
      const encounter = encounters[randomArrayIndex(encounters)].text
        .replace('$MONSTER', monster.name)
        .replace('$DESCRIPTION', monster.description);

      return `_${encounter}_`;
    })
    .catch(err => console.error(err));
}

/**
 * Execute monster failure-to-flee options
 * @param {Discord.TextChannel} channel Discord text channel to send information to
 * @param {Monster} monster Monster model to send action information from
 * @returns {undefined}
 */
function monsterFailsToFlee(channel, monster) {
  channel.send(monsterFailFleeEmbed(monster.name, monster.thumbnail));
}

/**
 * Execute monster flee actions and save game state
 * @param {Discord.TextChannel} channel Discord text channel to send information to
 * @param {Game} gameDoc Game model to save state on
 * @returns {undefined}
 */
function monsterFlees(channel, gameDoc) {
  channel.send(
    monsterFleeSuccessEmbed(gameDoc.monster.name, gameDoc.monster.thumbnail)
  );

  setGameState(gameDoc, false);
}

module.exports = {
  monsterIntro,
  monsterFailsToFlee,
  monsterFlees
};
