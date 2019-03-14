const random = require('random');

/**
 * Rolls for a percentage between 0 and 100 (in decimal/float form)
 * @returns {Number} Random float between 0 and 1
 */
function rollPercentage() {
  return random.float(0, 1);
}

module.exports = {
  rollPercentage
};
