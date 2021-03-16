const crypto = require('crypto');
const bcrypt = require('bcrypt');
const ResetToken = require('../models/reset_token');

/**
 * Creates reset token in the database and return the generated token. Using
 *  crypto to generate a random string and bcrypt to hash the string. Tokens are
 *  hash to fight against read access to database.
 * @param {string} userId Id of user the token is being taken for.
 * @return {promise} A promise to resolve with unhash token and the reset token.
 *  Will reject with an error if one occurs in bcrypt or mongoose.
 */
exports.generateToken = userId => {
  // Generate random string
  const token = crypto.pseudoRandomBytes(16).toString('hex');

  return bcrypt.genSalt(10).then(salt =>
    bcrypt.hash(token, salt).then(hash =>
      ResetToken({
        userId,
        token: hash
      })
        .save()
        .then(resetToken => ({ id: resetToken.id, token }))
    )
  );
};

/**
 * Gets a reset token from the database using the id of the token.
 * @param {string} id Id of token to search for.
 * @return {promise} A promise to resolve with a token if one is found, null
 *  otherwise. Will reject with an error from mongoose if one occurs.
 */
exports.getTokenById = id => ResetToken.findById(id).exec();

/**
 * Finds and removes token from collection using id of the token.
 * @param {string} id Id of the token to find and remove.
 * @return {Promise} A promise to resolve with a token if one is found, null
 *  otherwise. Will reject with an error from mongoose if one occurs.
 */
exports.removeToken = id => ResetToken.findByIdAndDelete(id).exec();
