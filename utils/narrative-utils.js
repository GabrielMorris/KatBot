const { randomArrayIndex } = require('../utils/utils');
const { setGameState } = require('./state-utils');
const {
  monsterFailFleeEmbed,
  monsterFleeSuccessEmbed
} = require('./embed-utils');
const Encounter = require('../models/game/encounter');

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

function monsterFailsToFlee(channel, monster) {
  channel.send(monsterFailFleeEmbed(monster.name, monster.thumbnail));
}

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
