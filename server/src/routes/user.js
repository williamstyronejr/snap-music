const path = require('path');
const router = require('express').Router();
const bodyParser = require('body-parser');
const multer = require('multer');
const mime = require('mime');

const {
  loggedIn,
  loggedOut,
  getCurrentUser,
  uploadFile,
} = require('../middlewares/user_middleware');
const {
  validateSignUp,
  validateInputs,
  validatePassword,
  validateTrackUpload,
  validatePasswordUpdate,
  validateAccountUpdate,
  validateReport,
  validateTrackUpdate,
  validateRecovery,
} = require('../middlewares/validation_middleware');
const {
  deleteUserAccount,
  getUserData,
  logUserIn,
  reportProfile,
  resetPassword,
  sendResetPasswordEmail,
  updateFollow,
  updatePassword,
  updateAccount,
  updateProfileImage,
  userLogout,
  userProfile,
  userSignup,
} = require('../controllers/user');
const {
  getTrackInfo,
  uploadTrack,
  deleteUserTrack,
  updateUserTrack,
} = require('../controllers/track');

/**
 * Filters image being uploaded to see if it meets the requirements. The file
 * must have a extension of JPEG, PNG, or JPEG.
 * @param {object} req Express request object.
 * @param {object} file File information to be uploaded.
 * @param {function} cb Callback to receive a boolean indicating if the file
 *  should be uploaded.
 */
function imageFilter(req, file, cb) {
  const ext = mime.getExtension(file.mimetype);

  if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
    const err = new Error();
    err.status = 400;
    err.msg = { profile: 'Image provided is not acceptable format.' };
    return cb(err);
  }

  return cb(null, true);
}

/**
 * Determines if a uploaded track should be stored by the following criteria:
 *  Must have the file extension of MP3.
 * @param {object} req Express request object
 * @param {object} file Data on file to be uploaded
 * @param {function} cb Callback to receive a boolean indicating if the
 *  file should be uploaded.
 */
function mediaFilter(req, file, cb) {
  const ext = mime.getExtension(file.mimetype);

  if (!ext) {
    const err = new Error();
    err.status = 400;
    err.msg = { track: 'Track provided is not acceptable format.' };
    return cb(err);
  }

  return cb(null, true);
}

// Middlewares for grabbing request data
const trackUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: mediaFilter,
}).fields([
  { name: 'track', maxCount: 1 },
  { name: 'coverArt', maxCount: 1 },
]);
const profileUploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
}).single('profile');
const coverArtParser = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
}).single('coverArt');

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

/** Routes for user signin, signout, signup */
router.post('/signup', loggedOut, jsonParser, validateSignUp, userSignup);

router.post('/signin', loggedOut, jsonParser, logUserIn);

router.post('/signout', loggedIn, userLogout);

router.post(
  '/settings/account/deletion',
  loggedIn,
  getCurrentUser,
  deleteUserAccount
);

// Validator for user inputs like username and email
router.get(
  '/inputs',
  urlencodedParser,
  jsonParser,
  validateInputs,
  (req, res, next) => res.json({ success: true })
);

router.post(
  '/account/recovery',
  jsonParser,
  validateRecovery,
  sendResetPasswordEmail
);

router.post('/account/reset', jsonParser, validatePassword, resetPassword);

router.post(
  '/report/profile/:userId',
  loggedIn,
  jsonParser,
  validateReport,
  reportProfile
);

// User profile routes
router.get('/user/:userId/data', jsonParser, userProfile);

router.post('/user/:userId/follow', loggedIn, jsonParser, updateFollow);

router.get('/session/user', loggedIn, getUserData);

router.get('/user/profile/track', getTrackInfo);

// Routes for editing user data
router.post(
  '/upload/track',
  loggedIn,
  getCurrentUser,
  trackUploader,
  validateTrackUpload,
  uploadFile,
  uploadTrack
);

router.post(
  '/settings/password',
  loggedIn,
  getCurrentUser,
  jsonParser,
  validatePasswordUpdate,
  updatePassword
);

router.post(
  '/settings/account',
  loggedIn,
  getCurrentUser,
  jsonParser,
  validateAccountUpdate,
  updateAccount
);

router.post(
  '/settings/account/image',
  loggedIn,
  profileUploader,
  uploadFile,
  updateProfileImage
);

router.post(
  '/user/track/delete',
  jsonParser,
  loggedIn,
  getCurrentUser,
  deleteUserTrack
);

router.post(
  '/user/track/update',
  loggedIn,
  coverArtParser,
  validateTrackUpdate,
  uploadFile,
  updateUserTrack
);

module.exports = router;
