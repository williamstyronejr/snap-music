const { getGenreList, createGenre } = require('../services/genre');

/**
 * Route handler for getting non-user genre list.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {object} next Express next function to be called
 */
exports.pullGenreData = (req, res, next) => {
  getGenreList('-_id -__v')
    .then(genreList => res.json(genreList))
    .catch(err => {
      next(err);
    });
};

/**
 * Route handler for creating genre. Used for dev, not production.
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {object} next Express next function to be called
 */
exports.createGenre = (req, res) => {
  createGenre(req.body.name, req.body.custom).catch(err => {});
  res.json({ success: true });
};
