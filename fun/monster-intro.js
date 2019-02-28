const Encounter = require('../models/game/encounter');
const { randomArrayIndex } = require('../utils/utils');

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

module.exports = monsterIntro;
