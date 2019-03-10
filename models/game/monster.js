const mongoose = require('mongoose');

const monsterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  health: { type: Number, required: true },
  xpValue: { type: Number, required: true },
  damage: { type: Number, required: true },
  thumbnail: { type: String, required: true },
  description: { type: String, required: true },
  outro: { type: String, required: true },
  isBoss: { type: Boolean, required: true }
});

monsterSchema.set('timestamps', true);
monsterSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('monster', monsterSchema);
