const bcrypt = require('bcrypt');
const {
  createUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  updateUserById,
  verifyPassword,
  authenticateUser,
  deleteUserById,
} = require('../services/user');
const {
  generateToken,
  getTokenById,
  removeToken,
} = require('../services/reset_token');
const {
  getCurrentTrackByUser,
  deleteTracksByUserId,
  deleteActiveTrackByUserId,
  updateTrackAristByUserId,
  getTracksByArtists,
} = require('../services/track');
const { createReport } = require('../services/report');
const { sendTemplateEmail } = require('../services/mailer');
const {
  createFollow,
  removeFollowing,
  getFollowRelation,
  getAllUserFollowing,
} = require('../services/follow');
const { deleteFileFirebase } = require('../services/firebase');

const { IP, PORT, DOMAIN } = process.env;
const serverDomain = DOMAIN ? DOMAIN : `${IP}:${PORT}`;

/**
 * Hashs a password using bcrypt to generate salt(using 10 rounds) and a hash.
 * @param {String} password A password to be hashed.
 * @return {Promise<String>} A promise to resolve with hash for given password.
 */
function hashPassword(password) {
  return bcrypt.genSalt(10).then((salt) => bcrypt.hash(password, salt));
}

/**
 * Route handler for getting the current user's data. Responses with a JSON
 *  of the user data if found.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.getUserData = (req, res, next) => {
  const projection = {
    displayName: true,
    username: true,
    email: true,
    profilePicture: true,
    bio: true,
  };

  getUserById(req.session.userId, projection)
    .then((user) => {
      if (user) return res.json({ success: true, user });

      // Destory cookie since no valid user exists
      return req.session.destroy((err) => {
        if (err) {
          const error = new Error("Could not delete user's session data");
          error.status = 500;
          error.msg = 'Server Problem. Please try again';
          return next(error);
        }

        return res.json({ success: false });
      });
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Route handler for signing a user up for an account. Responses with a redirect
 *  to dashboard page.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.userSignup = async (req, res, next) => {
  const { email, password } = req.body;
  const username = req.body.username.toLowerCase();

  try {
    // If username is already in use, response with error message
    const { usernameExists, emailExists } = await Promise.all([
      getUserByUsername(username),
      getUserByEmail(email),
    ]);

    if (usernameExists || emailExists) {
      const userErr = new Error(`Username, ${username}, already exist.`);
      userErr.status = 400;
      userErr.msg = {};
      if (usernameExists) userErr.msg.username = 'Username is already is use';
      if (emailExists) userErr.msg.emailExists = 'Email is already in use';
      throw userErr;
    }

    const hash = await hashPassword(password);
    const user = await createUser(username, email, hash);

    // Add userId to session, and return user data
    req.session.userId = user.id;
    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for logging in a user with an username/password pair, and
 *  returning the user's data back on successful authenication.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.userSignin = (req, res, next) => {
  const { password } = req.body;
  const username = req.body.user.toLowerCase();

  authenticateUser(username, password)
    .then((user) => {
      req.session.userId = user.id;
      res.json({
        success: true,
        user: {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          email: user.email,
          bio: user.bio,
          profilePicture: user.profilePicture,
        },
      });
    })
    .catch((err) => {
      return next(err);
    });
};

/**
 * Route handler for logging the session user out.
 * @param {Object} res Express response object
 * @param {Object} req Express request object
 * @param {Function} next Express next function to be called
 */
exports.userLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      const error = new Error("Could not delete user's session data");
      error.status = 500;
      error.msg = 'Server Problem. Please try again';
      return next(error);
    }

    return res.redirect('/');
  });
};

/**
 * Route handler for making a report against a user's profile or track.
 *  Responses with a success message if report is created.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.reportProfile = async (req, res, next) => {
  const { details, profile, track } = req.body;
  const { userId } = req.params;

  try {
    const user = await getUserById(userId);

    if (!user) {
      const err = new Error(`${req.session.userId} tried reporting ${userId}`);
      err.status = 400;
      err.msg = { user: 'This user does not exists.' };
      return next(err);
    }
  } catch (err) {
    err.status = 400;
    err.msg = { user: 'This user does not exists.' };
    return next(err);
  }

  try {
    await createReport(req.session.userId, userId, profile, track, details);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Route handler for getting user's profile data. Response with JSON
 *  containing user profile information and their current track.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.userProfile = async (req, res, next) => {
  const { userId } = req.params;

  const userProjection = {
    hash: false,
    email: false,
  };

  const trackProjection = {
    meta: false,
  };

  try {
    const user = await getUserById(userId, userProjection);

    if (!user) {
      const userErr = new Error(`No user by the id, ${userId}`);
      userErr.status = 404;
      userErr.msg = 'User does not exist';
      return next(userErr);
    }

    // Get profiles track, and if visitor is following
    const [following, track] = await Promise.all([
      getFollowRelation(user.id, req.session.userId),
      getCurrentTrackByUser(user.id, trackProjection),
    ]);

    res.json({
      user: {
        id: user.id,
        following: following ? true : false,
        isCurrent: user.id === req.session.userId,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        meta: user.meta,
        followers: user.followers,
        bio: user.bio,
      },
      track,
    });
  } catch (err) {
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      const error = new Error(`Invalid userId, ${userId}\n${err.stack}`);
      error.status = 404;
      return next(error);
    }

    next(err);
  }
};

/**
 * Route handler for changing following status of session user with user in
 *  URL params. Responses with a success message if action succeeded.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.updateFollow = async (req, res, next) => {
  const { userId } = req.params;

  // If user is trying to follow themselves, throw an error
  if (req.session.userId === userId) {
    const err = new Error(
      `User ${req.params.userId} tried to follow themselve`
    );
    err.status = 400;
    err.msg = 'Unable to follow this user';
    return next(err);
  }

  try {
    const follower = await getUserById(req.session.userId);

    // Removing should improve speed
    const followRelation = await removeFollowing(userId, req.session.userId);

    if (!follower) {
      const sameUserErr = new Error('Session user does not exists');
      sameUserErr.status = 500;
      sameUserErr.msg = 'Unable to follow this user';
      return next(sameUserErr);
    }

    // Update the user being followed and create a follow relation if needed
    let inc;
    if (followRelation) {
      inc = -1;
      await updateUserById(userId, { $inc: { followers: inc } });
    } else {
      inc = 1;
      await Promise.all([
        createFollow(userId, req.session.userId),
        updateUserById(userId, { $inc: { followers: inc } }),
      ]);
    }

    res.json({ success: true, increment: inc });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for updating user password. Response with a success message
 *  if password is updated, or an error in JSON if current password is not
 *  correct.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.updatePassword = async (req, res, next) => {
  const { currentPass, newPass } = req.body;

  // ONLY FOR DEMO
  if (req.user.username === 'guest')
    return next(new Error('Guest can not change password.'));

  try {
    const verified = await verifyPassword(req.session.userId, currentPass);

    // User entered incorrect password, response with json error.
    if (!verified) {
      const error = new Error('Current password was not valid');
      error.status = 400;
      error.msg = { currentPass: 'Invalid current password' };
      return next(error);
    }
  } catch (err) {
    return next(err);
  }

  try {
    const hash = await hashPassword(newPass);
    await updateUserById(req.session.userId, { hash });

    res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for sending reset password email. Generates a token and sends
 *  it to the user's primary email. If no user is found, send success message
 *  anyway.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next function to be called.
 */
exports.sendResetPasswordEmail = async (req, res, next) => {
  const { username } = req.body;

  // ONLY FOR DEMO
  if (username === 'guest')
    return next(new Error('Guest user can not be changed.'));

  try {
    const user = await getUserByUsername(username, { email: true });

    // No user is found, send success message anyway and logged failed attempt.
    if (!user) return res.json({ success: true });

    const { id, token } = await generateToken(user.id);

    sendTemplateEmail(
      'password_recovery.html',
      user.email,
      'Password Reset',
      {
        link: `${serverDomain}/account/reset?id=${id}&token=${token}`,
        username,
      },
      (err, mailData) => {
        if (err) return next(err);

        res.json({ success: true });
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Route handler for reseting password. Verifies and removes that token and
 *  emails user that their password was changed.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next function to be called.
 */
exports.resetPassword = async (req, res, next) => {
  const { id, token } = req.query;
  const { password } = req.body;

  try {
    const resetToken = await getTokenById(id);

    if (!resetToken) {
      const err = new Error('Invalid token used for reset');
      err.status = 400;
      err.msg = { token: 'Token does not exists. ' };
      return next(err);
    }

    // Check if hash is correct
    const verified = await resetToken.verifyToken(token);

    if (!verified) {
      const err = new Error('Token expired');
      err.status = 400;
      err.msg = { token: 'Token expired.' };
      return next(err);
    }

    const hash = await hashPassword(password);
    const user = await updateUserById(resetToken.userId, { hash });
    await removeToken(resetToken.id);

    // Email user that they made a request to change password
    sendTemplateEmail(
      'password_change.html',
      user.email,
      'Password Change',
      {},
      (err, mailData) => {
        res.json({ success: true });
      }
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Route handler for updating account data like username, email, and
 *  profile image. Responses with an JSON containing updated fields.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next function to be called.
 */
exports.updateAccount = async (req, res, next) => {
  const { username, email, bio, displayName } = req.body;

  // ONLY FOR DEMO
  if (req.user.username === 'guest')
    return next(new Error('Guest user can not be changed.'));

  // Check if username or email is already in use
  const params = {};

  if (username) params.username = username.toLowerCase();
  if (displayName) params.displayName = displayName;
  if (username && !displayName) params.displayName = username.toLowerCase();
  if (email) params.email = email;
  if (bio) params.bio = bio;

  try {
    await updateUserById(req.session.userId, params);

    // If displayName was updated, change any tracks by that user's id
    if (params.displayName)
      await updateTrackAristByUserId(req.session.userId, displayName);

    res.json({ success: true, data: params });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for updating profile image. Responses with JSON containing
 *  updated parameters.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next function to be called.
 */
exports.updateProfileImage = async (req, res, next) => {
  const { file, fileLoc } = req;
  const remove = req.body ? !!req.body.remove : false;
  const { userId } = req.session;
  let params = {};

  // Remove current image and go back to default
  if (remove) {
    params = { profilePicture: '/img/default.jpeg' };
    try {
      const user = await updateUserById(userId, params);

      // Deletes old file if not default
      if (user && !user.profilePicture.includes('default.jpeg')) {
        await deleteFileFirebase(user.profilePicture);
      }

      return res.json({ success: true, updated: true, data: params });
    } catch (err) {
      return next(err);
    }
  }

  // No action to take, just return a success message
  if (!file) return res.json({ success: true });

  params.profilePicture = fileLoc.fileLocation;

  try {
    const user = await updateUserById(userId, params);

    if (user && !user.profilePicture.includes('default.jpeg')) {
      await deleteFileFirebase(user.profilePicture);
    }

    res.json({ success: true, updated: true, data: params });
  } catch (err) {
    next(err);
  }
};

/**
 * Route handler for validating username and/or email. Responses with a
 *  JSON containing errors if they occur.
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {Function} next Express next function to be called.
 */
exports.validateInputs = async (req, res, next) => {
  const { username, email } = req.query;

  const response = {};
  let errorOccur = false;

  try {
    if (username) {
      const user = await getUserByUsername(username);

      if (user) {
        response.username = 'Username is already in use';
        errorOccur = true;
      }
    }

    if (email) {
      const user = await getUserByEmail(email);

      if (user) {
        response.email = 'Email is already in use';
        errorOccur = true;
      }
    }
  } catch (err) {
    return next(err);
  }

  if (errorOccur) return res.status(400).json(response);
  res.json();
};

/**
 * Route handler for deleting a user's account. Delete's all user's tracks and
 *  user data.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function be called
 */
exports.deleteUserAccount = async (req, res, next) => {
  const { userId } = req.session;

  // ONLY FOR DEMO
  if (req.user.username === 'guest')
    return next(new Error('Guest user can not be changed.'));

  try {
    // Delete any tracks that they own and then the user
    await deleteActiveTrackByUserId(userId);
    await deleteTracksByUserId(userId);
    await deleteUserById(userId);

    req.session.destroy((err) => {
      if (err) {
        const error = new Error("Could not delete user's session data");
        error.status = 500;
        throw error;
      }

      return res.json({ success: true });
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for getting user's feed from following list.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function be called
 */
exports.getUserFeed = async (req, res, next) => {
  const { userId } = req.session;

  try {
    const followingList = await getAllUserFollowing(userId);
    const trackList = await getTracksByArtists(followingList);

    return res.json({ tracks: trackList });
  } catch (err) {
    return next(err);
  }
};
