const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  guildID: { type: String, required: true },
  memberID: { type: String, required: true },
  class: { type: String, required: true },
  experience: { type: Number, required: true },
  health: { type: Number, required: true },
  mana: { type: Number, required: true },
  pronouns: { type: String, required: true },
  gold: { type: Number, required: true }
});

characterSchema.set('timestamps', true);
characterSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('character', characterSchema);
