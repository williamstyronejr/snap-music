const Genre = require('../models/genres');

exports.getAllGenres = (projection = null) => {
  return Genre.find({}, projection).exec();
};

exports.getStandardGenres = (projection = null) => {
  return Genre.find({ custom: false }, projection).exec();
};
