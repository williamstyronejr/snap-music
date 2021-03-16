const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  hash: { type: String, required: true, unique: true },
  followers: { type: Number, default: 0 },
  profilePicture: { type: String },
  bio: { type: String, maxlength: 140 },
  meta: {
    created: { type: Date, default: Date.now },
    bestRating: { type: Number },
  },
});

let User;

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  },
});

/**
 * Authenicates the user by comparing hash on DB with provided password. Rejects
 *  with an error if the username doesn't match or if the password is invalid.
 * @param {String} username A user's username
 * @param {String} password A user's non-hashed password
 * @returns {Promise<Boolean>} Returns a promise to resolve with a user object
 *  if the user was authenticated, otherwise reject with error indicating
 *  the issue.
 */
UserSchema.statics.authenticate = async function authenticate(
  username,
  password
) {
  try {
    const user = await User.findOne({ username }).exec();

    if (!user) {
      const userErr = new Error('Username is not found in DB');
      userErr.status = 401;
      userErr.msg = 'Invalid username or password';
      throw userErr;
    }

    // Validate password
    const validPassword = await user.verifyPassword(password);
    if (validPassword) return user;

    const pwErr = new Error('Invalid password');
    pwErr.status = 401;
    pwErr.msg = 'Invalid username or password';
    throw pwErr;
  } catch (err) {
    throw err;
  }
};

UserSchema.method('verifyPassword', function verifyPassword(password) {
  return bcrypt.compare(password, this.hash);
});

User = mongoose.model('User', UserSchema);
module.exports = User;
