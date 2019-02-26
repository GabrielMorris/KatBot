const mongoose = require('mongoose');

const emojiSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

emojiSchema.set('timestamps', true);
emojiSchema.set('toObject', {
  virtuals: true,
  tarnsform: (doc, ret) => {
    (ret.id = ret._id), delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('emoji', emojiSchema);
