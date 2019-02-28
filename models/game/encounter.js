const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

encounterSchema.set('timestamps', true);
encounterSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('encounter', encounterSchema);
