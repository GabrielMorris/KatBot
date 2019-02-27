const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  guildID: { type: String, required: true },
  monsterAlive: { type: Boolean, required: true },
  monster: { type: Object }
});

gameSchema.set('timestamps', true);
gameSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('game', gameSchema);
