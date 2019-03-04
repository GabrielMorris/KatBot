/* eslint-disable quotes */
// TODO: figure out how to give proper credit for these per the license
const classes = [
  {
    name: 'crusader',
    base: {
      HP: 10,
      MP: 0,
      STR: 10,
      DEF: 10,
      AGI: 1,
      LUCK: 1
    },
    growth: {
      HP: 2,
      MP: 0,
      STR: 3,
      DEF: 2,
      AGI: 1,
      LUCK: 1
    },
    isMage: false,
    description:
      "An iron will bound to unshakeable resolve, the Crusader's oath once given is never broken. A veteran of many wars, they seek to purify this land from the Taint.",
    thumbnail: 'https://i.imgur.com/OQ3PN4B.png'
  },
  {
    name: 'gunslinger',
    base: {
      HP: 3,
      MP: 0,
      STR: 6,
      DEF: 2,
      AGI: 5,
      LUCK: 2
    },
    growth: {
      HP: 1,
      MP: 0,
      STR: 1,
      DEF: 1,
      AGI: 4,
      LUCK: 2
    },
    isMage: false,
    description:
      "The Gunslinger's aim is guided as much by their heart as their eyes. A rogue cast out by society, they found their way to this wretched path seeking redemption for their crimes.",
    thumbnail: 'https://i.imgur.com/qbfzJm2.png'
  },
  {
    name: 'houndmaster',
    base: {
      HP: 7,
      MP: 0,
      STR: 5,
      DEF: 8,
      AGI: 2,
      LUCK: 2
    },
    growth: {
      HP: 2,
      MP: 0,
      STR: 3,
      DEF: 3,
      AGI: 3,
      LUCK: 2
    },
    isMage: false,
    description:
      'The bond between man and beast is forged through the fires of many battles. Loyalty is paramount to the Houndmaster, and the spirits of both man and hound are inextricably bound together, for better or worse.',
    thumbnail: 'https://i.imgur.com/54X2nSb.png'
  },
  {
    name: 'pyromancer',
    base: {
      HP: 3,
      MP: 10,
      STR: 2,
      DEF: 2,
      AGI: 2,
      LUCK: 2
    },
    growth: {
      HP: 1,
      MP: 2,
      STR: 1,
      DEF: 1,
      AGI: 4,
      LUCK: 1
    },
    isMage: true,
    description:
      "A student of the flame, the Pyromancer's frail mortal coil is sustained by the raw energies of the Eternal Flame. The raw power of fire is difficult to wield and can be deadly, both to friend and foe.",
    thumbnail: 'https://i.imgur.com/bpkiPGs.png'
  },
  {
    name: 'cleric',
    base: {
      HP: 6,
      MP: 5,
      STR: 4,
      DEF: 3,
      AGI: 2,
      LUCK: 5
    },
    growth: {
      HP: 2,
      MP: 2,
      STR: 3,
      DEF: 1,
      AGI: 3,
      LUCK: 1
    },
    isMage: true,
    description:
      "Holy men rest their faith not in the physical, but the spiritual. The Cleric's faith is pure and their strength divine.",
    thumbnail: 'https://i.imgur.com/smLSQrN.png'
  }
];

module.exports = classes;
