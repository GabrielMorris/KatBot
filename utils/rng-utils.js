const random = require('random');

/**
 * Rolls for a percentage between 0 and 100 (in decimal/float form)
 * @returns {Number} Random float between 0 and 1
 */
function rollPercentage() {
  return random.float(0, 1);
}

/**
 * Rolls for an integer between 0 and max
 * @param {Number} max Exclusive upper bound
 * @returns {Number} Random integer between 0 and max (inclusive)
 */
function rollInt(max) {
  return random.int(0, max);
}

module.exports = {
  rollPercentage,
  rollInt
};
