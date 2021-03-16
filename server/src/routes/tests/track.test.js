const path = require('path');
const request = require('supertest');
const app = require('../../services/app');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../../services/database');
const { setupRedis, closeConnection } = require('../../services/redis');
const {
  createRandomField,
  createUser,
  logUserIn,
  createTrack,
  getTrackData,
} = require('./utils');

const { REDIS_HOST, REDIS_PORT, DB_TEST_URI } = process.env;

const password = 'pass';
let username1;
let username2;
let email1;
let email2;
let userCookie1;
let userCookie2;
let uploadedTrack;

// Parameters for creating track
const trackTitle = 'title';
const trackGenre = 'genre';
const trackTag = 'tag';
const fileLocation = path.join(__dirname, 'files', 'music.mp3');

// Allow for firebase upload
beforeAll(async () => {
  // Create user fields
  [username1, username2, email1, email2] = await Promise.all([
    createRandomField(8),
    createRandomField(8),
    createRandomField(6, '@email.com'),
    createRandomField(6, '@email.com'),
  ]);
  await connectDatabase(DB_TEST_URI);

  // Open redis connection and create new users
  await Promise.all([
    createUser(app, username1, password, email1),
    createUser(app, username2, password, email2),
    setupRedis(REDIS_PORT, REDIS_HOST),
  ]);

  [userCookie1, userCookie2] = await Promise.all([
    logUserIn(app, username1, password),
    logUserIn(app, username2, password),
  ]);

  await createTrack(
    app,
    userCookie2,
    trackTitle,
    trackGenre,
    trackTag,
    fileLocation
  );

  // Get uploaded track data
  uploadedTrack = await getTrackData(app, userCookie1, username2);
}, 15000);

afterAll(async () => {
  closeConnection();
  await disconnectDatabase();
});

describe('GET /discovery/:genre/tracks', () => {
  const routeToTest = (genre) => `/discovery/${genre}/tracks`;

  test('Valid parameters returns an empty array', async () => {
    const genre = 'rap';
    await request(app)
      .get(routeToTest(genre))
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});

describe('GET /charts/:genre', () => {
  const routeToTest = (genre) => `/charts/${genre}`;

  test('Valid parameters for nonexisting genre should return an empty array', async () => {
    const nonExistingGenre = 'fjdnkskfjnds3y78432';
    await request(app)
      .get(routeToTest(nonExistingGenre))
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body).toHaveLength(0);
      });
  });

  test('Valid parameter should return an array of tracks', async () => {
    await request(app)
      .get(routeToTest(trackGenre))
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});

describe('GET /genres', () => {
  const routeToTest = () => '/genres';

  test('Request responses with array of genres', async () => {
    await request(app)
      .get(routeToTest())
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });
});

describe('POST /track/:id/vote', () => {
  const routeToTest = (id) => `/track/${id}/vote`;

  test('Request without auth throws 401 error', async () => {
    await request(app).post(routeToTest('test')).expect(401);
  });

  test('Non-existing track id throws 500 error', async () => {
    await request(app)
      .post(routeToTest('id'))
      .set('Cookie', userCookie1)
      .expect(500);
  });

  test('Liking a track responses with 200 success message and updated number of likes', async () => {
    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.likes).toBeGreaterThan(0);
      });
  });

  test('Unliking a track shoud response with a 200 success message and update number of likes', async () => {
    // Like a track
    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .expect(200);

    // Unlike the same track
    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ remove: true })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.likes).toBe(0);
      });
  });

  test('Liking a track already liked should not increase the rating twice', async () => {
    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.likes).toBe(1);
      });

    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeFalsy();
      });
  });

  test('Unliking a track more than once should descrease the rating twice', async () => {
    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ remove: true })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.likes).toBe(0);
        firstRatingCount = res.body.likes;
      });

    await request(app)
      .post(routeToTest(uploadedTrack.id))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ remove: true })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeFalsy();
      });
  });
});
