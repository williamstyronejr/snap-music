const User = require('../models/user');
const { deleteFileFirebase } = require('./firebase');

/**
 * Creates a user using the provide parameters. The parameters username, email,
 *  and hash are required, any other parameters needed should be passed by rest.
 * @param {string} username The username for the user
 * @param {string} email The email for the user
 * @param {string} hash The hashed version of the user password.
 * @param {object} rest Any other fields values that are optional. Defaults to
 *  an empty object.
 * @return {promise} A promise to resolve with the new user or reject with an
 *  error.
 */
exports.createUser = (username, email, hash, rest = {}) => {
  return User({
    username,
    email,
    hash,
    profilePicture: '/img/default.jpeg',
    ...rest,
  }).save();
};

/**
 * Finds and deletes a user by their id as well as deleting the user's profile
 *  image from firebase.
 * @param {String} id Id of user
 * @return {Promise<Object>} Returns a promise to resolve with the deleted user
 *  object.
 */
exports.deleteUserById = (id) => {
  return User.findByIdAndDelete(id)
    .exec()
    .then((user) => {
      if (!user) return user;
      if (user.profilePicture.includes('default.jpeg')) return user;

      // Delete file on firebase
      return deleteFileFirebase(user.profilePicture);
    });
};

/**
 * Gets a user from database by their username.
 * @param {string} username Username of user to search for.
 * @param {object} projection Feilds of user to include/exclude.
 * @return {promise} A promise to resolve with a user if found, or null if none
 *  exists with given username.
 */
exports.getUserByUsername = (username, projection = null) =>
  User.findOne({ username }, projection).exec();

/**
 * Gets a user from the database by their email.
 * @param {string} email Email of user to search for.
 * @param {object} projection Fields of user to include/exclude.
 * @return {promise} A promise to resolve with a user if found, or null if none
 *  exists with given email.
 */
exports.getUserByEmail = (email, projection = null) =>
  User.findOne({ email }, projection).exec();

/**
 * Gets a user from db by their id.
 * @param {string} userId Id of user to get.
 * @param {object} projection Projection of fields to include in results.
 *  Defaults to null, getting all fields.
 * @return Returns a promise to resolve with the user document.
 */
exports.getUserById = (userId, projection = null) =>
  User.findById(userId, projection).exec();

/**
 * Updates any fields for a given user by their id.
 * @param {string} userId Id of user to update
 * @param {object} updateParams Object containing values to update
 * @param {Object} options Additional query options
 * @return Returns a promise to resolve with an user object or null if user is
 *  not found.
 */
exports.updateUserById = (userId, updateParams, options = null) => {
  return User.findByIdAndUpdate(userId, updateParams, options);
};

/**
 * Verify a user's unhashed password using bcrypt's compare function.
 * @param {string} userId Id of user to compare given password for.
 * @param {string} password The password to compared to user's hash.
 * @return {Promise} A promise to resolve with boolean for if passwords match.
 */
exports.verifyPassword = (userId, password) => {
  return User.findById(userId, { hash: true }).then((user) =>
    user.verifyPassword(password)
  );
};

/**
 * Authenticates a username and password pair.
 * @param {String} username User's username
 * @param {String} password User's non hashed password
 * @returns {Boolean} Returns a boolean indicating if the username and password
 *  are authentic.
 */
exports.authenticateUser = (username, password) => {
  return User.authenticate(username, password);
};
