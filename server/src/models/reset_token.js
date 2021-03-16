const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Token for resetting passwords, but can be used for other things.
const ResetTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true },
  created: { type: Date, expires: 900, default: Date.now } // Timeout 15 mins
});

/**
 * Compares a token to the hash using bcrypt's compare function.
 * @param {string} token The token to compare to hash.
 * @return {promise} A promise to resolve with a boolean to indicate if
 *  the token is correct. Will reject with an error from bcrypt's compare.
 */
ResetTokenSchema.methods.verifyToken = function verifyToken(token) {
  return bcrypt.compare(token, this.token);
};

const ResetToken = mongoose.model('ResetToken', ResetTokenSchema);
module.exports = ResetToken;
