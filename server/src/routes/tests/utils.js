const request = require('supertest');
const crypto = require('crypto');

/**
 * Creates a random string with the option to append for creating emails.
 * @param {Number} length Length of generated string
 * @param {String} append Optional string to append to the generated string
 * @return {Promise<String>} Returns a string to resolve with the random string.
 */
exports.createRandomField = (length = 10, append = '') => {
  return new Promise((res, rej) => {
    crypto.randomBytes(length / 2, (err, raw) => {
      if (err) return rej(err);

      res(`${raw.toString('hex')}${append}`);
    });
  });
};

/**
 * Sends request to log an user in and returns a cookie to be used for their
 *  login session.
 * @param {Object} app Express app to be used for test
 * @param {String} user Username or Email of user being logged in
 * @param {String} password Password of user being logged in
 * @return {Promise<String>} Returns a promise to resolve with the user's cookie
 */
exports.logUserIn = (app, user, password) => {
  return request(app)
    .post('/signin')
    .send({ user, password })
    .expect(200)
    .then((res) => res.header['set-cookie'][0]);
};

/**
 * Sends a request to create a new user.
 * @param {Object} app Express app to be used for test
 * @param {String} username Username for new user
 * @param {String} password Password for new user
 * @param {String} email Email for new user
 * @param {Number} status Expect status code to receive,
 * @return {Promise} Returns a promise to resolve when user is created.
 */
exports.createUser = (app, username, password, email, status = 200) => {
  return request(app)
    .post('/signup')
    .send({ username, email, password, confirm: password })
    .expect(status);
};

/**
 * Sends a request to upload a new track.
 * @param {Object} app Express app to send test through
 * @param {String} cookie Cookie for user to create track for
 * @param {String} title Title of track
 * @param {String} genre Genre type of track
 * @param {String} tags Tags of track
 * @param {String} file Path to file to be uploaded
 * @return {Promise} Returns a promise to resolve when the track is uploaded.
 */
exports.createTrack = (app, cookie, title, genre, tags, file) => {
  return request(app)
    .post('/upload/track')
    .set('Cookie', cookie)
    .type('form')
    .field('title', title)
    .field('genre', genre)
    .field('tags', tags)
    .attach('track', file)
    .expect(200);
};

/**
 * Sends a request to get user's profile data and filters out the track data.
 * @param {Object} app Express app to send test through
 * @param {String} cookie Session cookie for any user
 * @param {String} username Username of user to get data for
 * @return {Promise<Object>} Returns a promise to resolve with user's current
 *  track data.
 */
exports.getTrackData = (app, cookie, username) => {
  return request(app)
    .get(`/user/${username}/data`)
    .set('Cookie', cookie)
    .expect(200)
    .then((res) => res.body.track);
};

/**
 * Sends a request to get a user's profile data.
 * @param {Object} app Express app to send test through
 * @param {String} username Username of user to get profile data for
 * @param {Number} status Expected status response
 * @return {Promise<Object>} Returns a promise to resolve with user's profile
 *  data.
 */
exports.getUserData = (app, username, status = 200) => {
  return request(app)
    .get(`/user/${username}/data`)
    .expect(status)
    .then((res) => res.body);
};
