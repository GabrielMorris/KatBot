const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  memberID: { type: String, required: true },
  guildID: { type: String, required: true },
  experience: { type: Number, required: true }
});

levelSchema.set('timestamps', true);
levelSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('level', levelSchema);
