const mongoose = require('mongoose');

/**
 * Collection is being used as list of all genre on the site and to collect
 *  and store data on the genres usages.
 */
const genreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  custom: { type: Boolean, default: false }
});

/**
 * Before saving, if genre is custom, convert to lower case. Used to prevent
 *  multiple of the same type of genres.
 */
genreSchema.pre('save', function(next) {
  if (this.custom) this.name = this.name.toLowerCase();
  next();
});

const Genre = mongoose.model('genre', genreSchema);
module.exports = Genre;
