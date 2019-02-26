const mongoose = require('mongoose');

const katismSchema = new mongoose.Schema({
  text: { type: String, required: true }
});

katismSchema.set('timestamps', true);
katismSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('katism', katismSchema);
