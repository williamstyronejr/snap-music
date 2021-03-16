const Genre = require('../models/genre');

/**
 * Gets a list of all genres with an option to include custom genres.
 * @param {string} select Contains which fields to return.
 * @param {boolean} includeCustom Flag to include custom genres. Default false
 * @return {Promise} Returns a promise to resolve with array of genres.
 */
exports.getGenreList = (select = '', includeCustom = false) =>
  Genre.find({ custom: includeCustom })
    .select(select)
    .exec();

/**
 * Creates a genre in the database.
 * @param {string} name Name of genre.
 * @param {boolean} custom Flag for whether the genre is user created.
 * @return {Promise} Returns a promise to resolve with the created genre object
 */
exports.createGenre = (name, custom = false) =>
  Genre({
    name,
    custom
  }).save();
