const { randomArrayIndex } = require('../utils/utils');
const { setGameState } = require('./state-utils');
const {
  monsterFailFleeEmbed,
  monsterFleeSuccessEmbed
} = require('./embed-utils');
const Encounter = require('../models/game/encounter');
const BossEncounter = require('../models/game/boss-encounter');

/**
 * Construct encounter narrative text based on a given monster
 * @param {Monster} monster Monster model to base message information from
 * @returns {Promise<String|undefined>} Promise resolving to encounter text string if fulfilled or rejecting undefined on error
 */
/* === MONSTER NARRATIVE === */
function monsterIntro(monster) {
  if (monster.isBoss) {
    return BossEncounter.find()
      .then(encounters => _tokenizeEncounter(encounters, monster))
      .catch(err => console.error(err));
  } else {
    // Find a random encounter document
    return Encounter.find()
      .then(encounters => _tokenizeEncounter(encounters, monster))
      .catch(err => console.error(err));
  }
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

/**
 * Replaces tokens in encounter strings with monster values
 * @param {Encounters} array of possible encounter strings
 * @param {Monster} monster for whose values shall be replacing the tokens
 * @returns {String} italicized encounter text with tokens replaced by monster data
 */
function _tokenizeEncounter(encounters, monster) {
  // Replace the monster and description in the encounter doc with the monster name and description
  const encounter = encounters[randomArrayIndex(encounters)].text
    .replace('$MONSTER', monster.name)
    .replace('$DESCRIPTION', monster.description);

  return `_${encounter}_`;
}

module.exports = {
  monsterIntro,
  monsterFailsToFlee,
  monsterFlees
};
