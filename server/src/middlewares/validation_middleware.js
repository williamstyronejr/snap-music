const { body, param, query, validationResult } = require('express-validator');
const { getUserByEmail, getUserByUsername } = require('../services/user');

/**
 * Express middleware for checking if there were any validation errors. If any,
 *  will response with an JSON containing errors.
 * @param {object} req Express request object.
 * @param {object} res Express response object.
 * @param {function} next Express next function to be called.
 */
const validationCheck = (req, res, next) => {
  const errors = validationResult(req).formatWith(({ msg }) => msg);

  if (!errors.isEmpty()) {
    const err = new Error('Validator caught invalid user inputs.');
    err.status = 400;
    err.msg = errors.mapped();
    return next(err);
  }

  return next();
};

/**
 * Validation rules for password. Password must exists and be at least 4
 *  characters long.
 * @param {String} field Name of string to validate
 * @return {Object} Returns an express validator chain.
 */
const passwordCheck = (field) => {
  return body(field)
    .exists()
    .withMessage('Must provide password.')
    .isLength({ min: 4 })
    .withMessage('Password must be a minimum of 4 characters.');
};

/**
 * Validation rules for username
 * @param {String} field Name of field in "body" to test
 * @returns {Object} Returns a express validator chain.
 */
const usernameCheck = (field) => {
  return body(field)
    .exists()
    .withMessage('Must provide username.')
    .trim()
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .isLength({ min: 4, max: 32 })
    .withMessage('Username must be between 4 and 32 characters')
    .custom((username) =>
      getUserByUsername(username.toLowerCase()).then((user) => {
        if (user) return Promise.reject('Username is already in use.');
      })
    );
};

/**
 * Validation rules for signup
 */
exports.validateSignUp = [
  usernameCheck('username'),
  body('email', 'Invalid Email')
    .exists()
    .withMessage('Must provide email.')
    .isEmail()
    .withMessage('Invalid Email')
    .trim()
    .normalizeEmail(),
  passwordCheck('password'),
  body('confirm', 'Invalid confirm password')
    .exists()
    .withMessage('Must provide confirming password.')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  validationCheck,
];

/**
 * Validation rules for updating password
 */
exports.validatePasswordUpdate = [
  passwordCheck('currentPass'),
  passwordCheck('newPass'),
  body('confirmPass', 'Password must match.')
    .exists()
    .custom((val, { req }) => {
      if (val !== req.body.newPass) throw new Error('Passwords must match.');
      return true;
    }),
  validationCheck,
];

/**
 * Validatio rules for submtting a report.
 *  Details => Optional, limited to 500 characters (post trim).
 */
exports.validateReport = [
  body('details')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Invalid Inputs.'),
  validationCheck,
];

/**
 * Validation rules for getting chart list.
 *  genre: Must exist
 */
exports.validateCharts = [
  param('genre', 'Invalid Genre.')
    .exists()
    .withMessage('Must provide a genre.')
    .trim(),
  validationCheck,
];

/**
 * Validation rules for password
 */
exports.validatePassword = [passwordCheck('password'), validationCheck];

/**
 * Validation rules for updating an account.
 *  username: Optional, must only use letters, numbers, and underscores and can
 *    not already belong to a user.
 *  displayName: Optional, must only use letters, numbers, and underscores and
 *    must match the username sent or current user's username
 *  email: Optional, must be a valid email and can not already belong to an user.
 *  bio: Optional, must be no longer than 200 characters.
 */
exports.validateAccountUpdate = [
  body('username', 'Invalid username')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .isLength({ min: 4, max: 32 })
    .withMessage('Username must be between 4 and 32 characters')
    .custom((username) =>
      getUserByUsername(username.toLowerCase()).then((user) => {
        if (user) return Promise.reject('Username is already in use.');
      })
    ),
  body('displayName', 'Invalid display name')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_ ]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .custom((displayName, { req }) => {
      let displayMatch = displayName.replace(/\s+/g, '').toLowerCase();
      console.log(displayMatch);

      if (
        req.body.username &&
        displayMatch !== req.body.username.toLowerCase()
      ) {
        console.log('here');
        return Promise.reject(
          'Display name can only change the spaces and capitalization of username.'
        );
      }

      if (displayMatch !== req.user.username) {
        console.log('testing');
        return Promise.reject(
          'Display Name can only different by spaces and capitalization.'
        );
      }

      return Promise.resolve();
    }),
  body('email', 'Invalid email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email is not valid')
    .custom((email, { req }) =>
      getUserByEmail(email).then((user) => {
        if (user) {
          return Promise.reject('Email is already in use.');
        }
        return Promise.resolve();
      })
    ),
  body('bio', 'Invalid bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio should not be longer than 200 characters.'),
  validationCheck,
];

/**
 * Validation rules for track data when uploading.
 *  Title: Must exist and have at least 1 character.
 *  Genre: Must exist and have at least 1 character.
 *  Tags: Optional
 */
exports.validateTrackUpload = [
  body('title', 'Invalid title').exists().trim().isLength({ min: 1 }),
  body('genre', 'Invalid genre').exists().trim().isLength({ min: 1 }),
  body('tags', 'Invalid tags').optional().trim(),
  validationCheck,
];

/**
 * Validation rules for testing username or email usage.
 *  Username: Optional, Must only use letters, numbers, underscore, and can not
 *    already belong to an user.
 *  Email: Optional, Must be a valid email and can not already belong to an user.
 */
exports.validateInputs = [
  query('username', 'Invalid username')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .isLength({ min: 4, max: 32 })
    .withMessage('Username must be between 4 and 32 characters')
    .custom((username) =>
      getUserByUsername(username).then((user) => {
        if (user) return Promise.reject('Username is already in use.');
      })
    ),
  query('email', 'Invalid email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email is not valid')
    .custom((email, { req }) =>
      getUserByEmail(email).then((user) => {
        if (user) {
          return Promise.reject('Email is already in use.');
        }

        return Promise.resolve();
      })
    ),
  validationCheck,
];

/**
 * Validation rules for updating track info.
 *  Title: Optional, but must have at least one character.
 *  Genre: Optional, but must have at least one character.
 *  Tag: Optional
 */
exports.validateTrackUpdate = [
  body('title', 'Invalid title')
    .trim()
    .optional()
    .isLength({ min: 1 })
    .withMessage('A title is required.'),
  body('genre', 'Invalid genre')
    .trim()
    .optional()
    .isLength({ min: 1 })
    .withMessage('A genre is required'),
  body('tags', 'Invalid tags').trim().optional(),
  validationCheck,
];

/**
 * Validation rules for recovering account.
 *  Username: Must exist
 */
exports.validateRecovery = [
  body('username', 'You must provide an username').exists(),
  validationCheck,
];
