const logger = require('../services/winston');

/**
 * Route handler for response to errors.
 * @param {object} err Error passed through Express routes
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @param {function} next Express next function to be called
 */
exports.errorHandler = (err, req, res, next) => {
  if (err) {
    // Check for status to determine action
    if (err.status === 403) {
      if (err.to) {
        return res.redirect(err.to);
      }
      return res.status(err.status).send(err.msg);
    }

    if (err.status === 400) {
      return res.status(err.status).json(err.msg);
    }

    if (err.status === 401)
      return res.status(err.status).send('Requires user access.');

    return res.status(err.status || 500).send(err.msg || 'Server issues.');
  }
  // No error, return 404 page
  return res.status(404).send('404.');
};
