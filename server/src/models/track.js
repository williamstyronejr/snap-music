const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  artistId: { type: String, required: true },
  coverArt: { type: String, required: true },
  genre: { type: String },
  tags: { type: String },
  likes: [
    {
      userId: String,
    },
  ],
  rating: { type: Number, default: 0 },
  isExpired: { type: Boolean, default: false },
  expirable: { type: Boolean, default: true },
  explicit: { type: Boolean, default: false },
  fileUrl: { type: String, required: true },
  meta: {
    created: { type: Date, default: Date.now },
  },
});

TrackSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

const Track = mongoose.model('Track', TrackSchema);
module.exports = Track;
