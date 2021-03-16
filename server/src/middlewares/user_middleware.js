const crypto = require('crypto');
const mime = require('mime');
const { uploadFileFirebase } = require('../services/firebase');
const { getUserById } = require('../services/user');

/**
 * Creates a file name using a string of 16 random chars with the date appended
 * @param {Object} file File to create name for (to figuring out extension)
 * @return {Promise<String>} Returns a promise to response with a new filname
 *  if one was created, or the original file name.
 */
async function createFileName(file) {
  return new Promise((res, rej) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      const ext = mime.getExtension(file.mimetype);
      if (err) res(`${file.filename + Date.now()}.${ext}`);

      // Check extension type
      return res(`${raw.toString('hex') + Date.now()}.${ext}`);
    });
  });
}

/**
 * Authentication middleware to allow route access only if a user is logged in.
 *  If no a user is logged in, then a unauthorized (401) error is thrown.
 *  throw.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function to be called
 */
exports.loggedIn = (req, res, next) => {
  // User is logged in, pass to next
  if (req.session && req.session.userId) return next();

  // No user logged, throw error
  const err = new Error('No user in logged in');
  err.status = 401;
  err.msg = 'No user logged in.';
  return next(err);
};

/**
 * Authentication middleware to allow route access only if a user is logged in.
 *  If no user is logged in, then a redirect error is thrown.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function to be called
 * @returns
 */
exports.loggedInRedirect = (req, res, next) => {
  // User is logged in, pass to next
  if (req.session && req.session.userId) return next();

  // No user logged, throw error
  const err = new Error('No user in session');
  err.status = 403;
  err.msg = 'No user logged in.';
  err.to = '/signin';
  return next(err);
};

/**
 * Authentication middleware to allow route access only if there is no user
 *  logged in. If a user is logged in, response with a redirect to chart page.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function to be called
 */
exports.loggedOut = (req, res, next) => {
  // If user session exists response with redirect
  if (req.session && req.session.userId) {
    const err = new Error('User is logged in session');
    err.status = 403;
    err.msg = 'User is logged in';
    err.to = '/chart';
    return next(err);
  }

  return next();
};

/**
 * Gets the session user if logged in and stores them in the req under
 *  req.user. If no user in the session, just calls next function.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function to be called
 */
exports.getCurrentUser = (req, res, next) => {
  if (!req.session.userId) return next();

  return getUserById(req.session.userId)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch((err) => {
      next(err);
    });
};

/**
 * Middleware for uploading a profile image to firebase storage with a random
 *  filename. Changes req.fileLoc to be object with fieldName and fileLocation
 *  containing the name of the field and the file url respectfully.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} next Next function to be called
 */
exports.uploadFile = (req, res, next) => {
  if (!req.file && !req.files) return next();

  // Handle uploading multiple files
  if (req.files) {
    let proms = [];

    Object.keys(req.files).forEach((key) => {
      req.files[key].forEach((file) => {
        proms.push(
          createFileName(file).then((fileName) =>
            uploadFileFirebase(file, fileName).then((result) => ({
              field: result.fieldName,
              fileLocation: result.fileLocation,
            }))
          )
        );
      });
    });

    return Promise.all(proms)
      .then((results) => {
        req.fileLoc = results;
        next();
      })
      .catch((err) => {
        next(err);
      });
  }

  createFileName(req.file).then((fileName) => {
    uploadFileFirebase(req.file, fileName)
      .then((results) => {
        req.fileLoc = {
          field: results.fieldName,
          fileLocation: results.fileLocation,
        };
        next();
      })
      .catch((err) => {
        next(err);
      });
  });
};
