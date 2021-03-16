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
 * Validation rules for password.
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

exports.validateSignUp = [
  body('username', 'Invalid Username')
    .exists()
    .withMessage('Must provide username.')
    .trim()
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .isLength({ min: 4, max: 16 })
    .withMessage('Username must be between 4 and 16 characters'),
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

exports.validateCharts = [
  param('genre', 'Invalid Genre.')
    .exists()
    .withMessage('Must provide a genre.')
    .trim(),
  validationCheck,
];

exports.validatePassword = [passwordCheck('password'), validationCheck];

exports.validateAccountUpdate = [
  body('username', 'Invalid username')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .isLength({ min: 4, max: 16 })
    .withMessage('Username must be between 4 and 16 characters')
    .custom((username) =>
      getUserByUsername(username).then((user) => {
        if (user) return Promise.reject('Username is already in use.');
      })
    ),
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
        return false;
      })
    ),
  body('bio', 'Invalid bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bio should not be longer than 200 characters.'),
  validationCheck,
];

exports.validateTrackUpload = [
  body('title', 'Invalid title').trim().isLength({ min: 1 }),
  body('genre', 'Invalid genre').trim().isLength({ min: 1 }),
  body('tags', 'Invalid tags').trim(),
  validationCheck,
];

exports.validateInputs = [
  query('username', 'Invalid username')
    .optional()
    .trim()
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Use only letters (a-z), numbers, and underscores.')
    .isLength({ min: 4, max: 16 })
    .withMessage('Username must be between 4 and 16 characters')
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
        return false;
      })
    ),
  validationCheck,
];

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

exports.validateRecovery = [
  body('username', 'You must provide an username').exists(),
  validationCheck,
];
