const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  custom: { type: Boolean, default: false },
  name: { type: String, required: true },
  image: { type: String, default: '' },
});

GenreSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

GenreSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

const Genre = mongoose.model('Genre', GenreSchema);
module.exports = Genre;
