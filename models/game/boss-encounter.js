const mongoose = require('mongoose');

const bossEncounterSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

bossEncounterSchema.set('timestamps', true);
bossEncounterSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('bossEncounters', bossEncounterSchema);
