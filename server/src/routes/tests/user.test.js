const path = require('path');
const request = require('supertest');
const app = require('../../services/app');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../../services/database');
const { createTrack } = require('../../services/track');
const {
  createRandomField,
  createUser,
  userSignin,
  getUserData,
} = require('./utils');
const { sendTemplateEmail } = require('../../services/mailer');
const { uploadFileFirebase } = require('../../services/firebase');

const { DB_TEST_URI: DB_URI } = process.env;

// Mocked to prevent sending emails and uploading to firebase
jest.mock('../../services/mailer');
jest.mock('../../services/firebase');

const password = 'pass';
let username1;
let username2;
let userId1;
let userId2;
let email1;
let email2;
let userCookie1;
let userCookie2;

beforeAll(async () => {
  // Create user fields
  [username1, username2, email1, email2] = await Promise.all([
    createRandomField(8),
    createRandomField(8),
    createRandomField(6, '@email.com'),
    createRandomField(6, '@email.com'),
  ]);

  await connectDatabase(DB_URI);

  // Create users and get session cookies and user data
  await Promise.all([
    createUser(app, username1, password, email1),
    createUser(app, username2, password, email2),
  ]);

  const [user1, user2] = await Promise.all([
    userSignin(app, username1, password),
    userSignin(app, username2, password),
  ]);

  userId1 = user1.user.id;
  userId2 = user2.user.id;
  userCookie1 = user1.cookie;
  userCookie2 = user2.cookie;
});

afterAll(async () => {
  await disconnectDatabase();
});

beforeEach(() => {
  // Reset mocks
  sendTemplateEmail.mockClear();
  uploadFileFirebase.mockClear();
});

describe('GET /session/user', () => {
  const routeToTest = () => '/session/user';

  test('Non-auth request should throw 401', async () => {
    await request(app).get(routeToTest()).expect(401);
  });

  test('Valid auth request should response with 200 and user data object', async () => {
    await request(app)
      .get(routeToTest())
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();

        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(username1);
        expect(res.body.user.email).toBe(email1);
      });
  });
});

describe('GET /user/:userId/data', () => {
  const routeToTest = (userId) => `/user/${userId}/data`;

  test('Invalid username should response with 404', async () => {
    const fakeUserId = createRandomField(5);
    await request(app).get(routeToTest(fakeUserId)).expect(404);
  });

  test('Valid username should response with 200 and user data', async () => {
    await request(app)
      .get(routeToTest(userId1))
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();

        expect(res.body.user).toBeDefined();
        expect(res.body.track).toBeDefined();

        expect(res.body.user.username).toBe(username1);
      });
  });
});

describe('GET /logout', () => {
  const routeToTest = () => '/signout';

  test('Non-auth request should throw 401 ', async () => {
    await request(app).post(routeToTest()).expect(401);
  });

  test('Valid auth request responses with 302', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie2)
      .expect(302);
  });
});

describe('GET /user/profile/track', () => {
  const routeToTest = () => '/user/profile/track';

  test('Valid request should response with 200', async () => {
    await request(app).get(routeToTest()).expect(200);
  });
});

describe('POST /signup', () => {
  const routeToTest = () => '/signup';

  test('Request with auth should response with 302', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .expect(302);
  });

  test('Invalid parameters should throw 400 with error message', async () => {
    const invalidUsername = '';
    const invalidPassword = '';
    const invalidEmail = '';

    await request(app)
      .post(routeToTest())
      .type('form')
      .send({
        username: invalidUsername,
        email: invalidEmail,
        password: invalidPassword,
        confirm: invalidPassword,
      })
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();

        expect(res.body.username).toBeDefined();
        expect(res.body.password).toBeDefined();
        expect(res.body.email).toBeDefined();
      });
  });

  test('Valid params should response with 200 and user data', async () => {
    const [validUsername, validPassword, validEmail] = await Promise.all([
      createRandomField(5),
      createRandomField(5),
      createRandomField(5, '@email.com'),
    ]);

    await request(app)
      .post(routeToTest())
      .send({
        username: validUsername,
        email: validEmail,
        password: validPassword,
        confirm: validPassword,
      })
      .then((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(validUsername);
        expect(res.body.user.email).toBe(validEmail);
      });

    // Attempt to log in for new user
    const newCookie = await userSignin(app, validUsername, validPassword);
    expect(newCookie).toBeDefined();
  });
});

describe('POST /signin', () => {
  const routeToTest = () => '/signin';

  test('Request with auth should response with 302', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .expect(302);
  });

  test('Invalid parameter should throw 401 error', async () => {
    const invalidUsername = 'r';
    const invalidPassword = 'r';

    await request(app)
      .post(routeToTest())
      .send({ user: invalidUsername, password: invalidPassword })
      .expect(401)
      .then((res) => {
        expect(res.body).toBeDefined();
      });
  });

  test('Valid parameters should response with 200 and user data', async () => {
    await request(app)
      .post(routeToTest())
      .send({ user: username2, password })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(username2);
      });
  });
});

describe('POST /report/profile/:username', () => {
  const routeToTest = (userId) => `/report/profile/${userId}`;

  test('Non-auth request should throw 401 error', async () => {
    await request(app).post(routeToTest('test')).expect(401);
  });

  test('Request reporting non-existing user should throw 400', async () => {
    await request(app)
      .post(routeToTest('test'))
      .set('Cookie', userCookie1)
      .expect(400);
  });

  test('Valid parameters should response with 200 and success', async () => {
    await request(app)
      .post(routeToTest(userId2))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({
        profile: false,
        track: true,
        details: 'Details',
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeDefined();
      });
  });
});

describe('POST /user/:userId/follow', () => {
  const routeToTest = (userId) => `/user/${userId}/follow`;

  test('Non-auth request should throw 401', async () => {
    await request(app).post(routeToTest('test')).expect(401);
  });

  test('Following self should throw 400 error', async () => {
    await request(app)
      .post(routeToTest(userId1))
      .set('Cookie', userCookie1)
      .expect(400);
  });

  test('Valid request should response with 200 and increment amount', async () => {
    await request(app)
      .post(routeToTest(userId2))
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.increment).toBeDefined();
      });
  });
});

describe('POST /settings/password', () => {
  const routeToTest = () => '/settings/password';

  test('Non-auth should throw 401', async () => {
    await request(app).post(routeToTest('test')).expect(401);
  });

  test('Invalid new password should throw 400', async () => {
    await request(app)
      .post(routeToTest('test'))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ currentPass: password, newPass: 't' })
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.newPass).toBeDefined();
      });
  });

  test('Invalid current password should throw 400', async () => {
    const currentPass = 'te';
    const newPass = 'tetestest';

    await request(app)
      .post(routeToTest('test'))
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ currentPass, newPass })
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.currentPass).toBeDefined();
      });
  });

  test('Valid parameters should response with 200 and can login', async () => {
    const newPassword = await createRandomField(8);
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({
        currentPass: password,
        newPass: newPassword,
        confirmPass: newPassword,
      })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });

    // Attempt log in with new password
    const cookie = await userSignin(app, username1, newPassword);
    expect(cookie).toBeDefined();
  });
});

describe('POST /settings/account', () => {
  const routeToTest = () => '/settings/account';

  test('Non-auth request should throw 401', async () => {
    await request(app).post(routeToTest()).expect(401);
  });

  test('Request with no parameters should response with 200', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });
  });

  test('Invalid username/email should throw 400 and error message ', async () => {
    const username = 't';
    const email = 'testing';

    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ username, email })
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.username).toBeDefined();
        expect(res.body.email).toBeDefined();
      });
  });

  test('Used username should throw 400 and error message', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ username: username1 })
      .expect(400)
      .catch((err) => {
        expect(err.response);
        expect(err.response.body).toBeDefined();
        expect(err.response.body.errors.username).toBeDefined();
      });
  });

  test('Used email should throw 400 and error message', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ email: email1 })
      .expect(400)
      .catch((err) => {
        expect(err.body).toBeDefined();
        expect(err.body.errors.email).toBeDefined();
      });
  });

  test('Display name that differs from current user should throw 400 and error message', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ displayName: username1 + '1' })
      .expect(400)
      .catch((err) => {
        expect(err.body).toBeDefined();
        expect(err.body.errors.email).toBeDefined();
      });
  });

  test('Non-matching username and displayName should throw 400 and error message', async () => {
    const newUsername = 'testf';

    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ displayName: newUsername + 1, newUsername })
      .expect(400)
      .catch((err) => {
        expect(err.body).toBeDefined();
        expect(err.body.errors.email).toBeDefined();
      });
  });

  test('Valid params should response with 200 and updated parameters', async () => {
    const [bio, newUsername] = await Promise.all([
      createRandomField(8),
      createRandomField(8),
    ]);

    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .set('Accept', 'application/json')
      .send({ username: newUsername, bio })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.data).toBeDefined();
        expect(res.body.data.bio).toBe(bio);
        expect(res.body.data.username).toBe(newUsername);
      });
  });
});

describe('GET /inputs', () => {
  const routeToTest = (query) => `/inputs?${query}`;

  test('Request with no parameters should response with 200', async () => {
    await request(app).get(routeToTest()).expect(200);
  });

  test('Invalid username and email should throw 400 with error message', async () => {
    await request(app)
      .get(routeToTest('username=1&email=1'))
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.username).toBeDefined();
        expect(res.body.email).toBeDefined();
      });
  });

  test('Used username and email should repsonse with 400 and error message', async () => {
    await request(app)
      .get(routeToTest(`username=${username2}&email=${email1}`))
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.username).toBeDefined();
        expect(res.body.email).toBeDefined();
      });
  });

  test('Valid username and email should response with 200', async () => {
    const testUsername = await createRandomField(6);
    const testEmail = await createRandomField(6, '@email.com');

    await request(app)
      .get(routeToTest(`username=${testUsername}&email=${testEmail}`))
      .expect(200);
  });
});

describe('POST /account/recovery', () => {
  const routeToTest = () => '/account/recovery';

  test('Valid username should response with 200 and success message and invokes emailer', async () => {
    await request(app)
      .post(routeToTest())
      .set('Accept', 'application/json')
      .send({ username: username1 })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });
  });
});

describe('POST /settings/account/image', () => {
  const routeToTest = () => '/settings/account/image';

  test('Non-auth request should response with 401', async () => {
    await request(app).post(routeToTest()).type('form').expect(401);
  });

  test('No image should response with 200 and success', async () => {
    await request(app)
      .post(routeToTest())
      .type('form')
      .expect(200)
      .set('Cookie', userCookie1)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });
  });

  test('Removing profile image should response with 200 and success', async () => {
    await request(app)
      .post(routeToTest())
      .type('form')
      .field('remove', true)
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.updated).toBeTruthy();
        expect(res.body.data.profilePicture).toBeDefined();
      });
  });

  test('Valid params should response with 200 and updated data', async () => {
    const fileLoc = path.join(__dirname, '/files', 'profileTest.jpeg');

    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .type('form')
      .attach('profile', fileLoc)
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
        expect(res.body.updated).toBeTruthy();
        expect(res.body.data).toBeDefined();
      });
  });
});

describe('POST /account/reset', () => {
  const routeToTest = (query) => `/account/reset?${query}`;
  const routeForRecovery = () => '/account/recovery';
  let query;
  let username;

  beforeAll(async () => {
    username = await createRandomField(8);
    let email = await createRandomField(8, '@email.com');

    // Create a new user
    await createUser(app, username, password, email);

    // Send request to reset password
    await request(app).post(routeForRecovery()).send({ username }).expect(200);

    expect(sendTemplateEmail).toHaveBeenCalled();
    query = sendTemplateEmail.mock.calls[0][3].link.split('?')[1];
  });

  test('Invalid password should response with 400 and error message', async () => {
    await request(app)
      .post(routeToTest(query))
      .send({ password: 'p' })
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.password).toBeDefined();
      });
  });

  test('Invalid id or token should throw 500', async () => {
    await request(app)
      .post(routeToTest('id=dsa&token=12234'))
      .send({ password: 'pass1' })
      .expect(500);
  });

  test('Valid parameters responses with 200 and success message', async () => {
    const newPass = await createRandomField(8);

    await request(app)
      .post(routeToTest(query))
      .send({ password: newPass })
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });

    // Test logging in with new password
    const cookie = await userSignin(app, username, newPass);
    expect(cookie).toBeDefined();
  }, 10000);
});

describe('POST /upload/track', () => {
  const routeToTest = () => '/upload/track';
  const title = 'title';
  const genre = 'rap';
  const tags = 'tags';

  test('Non-auth request should throw 401', async () => {
    await request(app).post(routeToTest()).expect(401);
  });

  test('No file request should throw 400', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .type('form')
      .field('title', title)
      .field('genre', genre)
      .field('tags', tags)
      .expect(400)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.track).toBeDefined();
      });
  });

  test('Valid parameters should response with 200 and success message', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .type('form')
      .field('title', title)
      .field('genre', genre)
      .field('tags', tags)
      .attach('track', path.join(__dirname, '/files', 'music.mp3'))
      .expect(200)
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });
  }, 15000); // Allow firebase upload
});

describe('POST /user/track/delete', () => {
  const routeToTest = () => '/user/track/delete';
  const title = 'title 1 ';
  const artist = 'username2';
  const genre = 'rap';
  const tags = 'pop';
  const fileUrl = 'google.com';
  let artistId = null;
  let track;

  beforeAll(async () => {
    await request(app)
      .get('/session/user')
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        artistId = res.body.user.id;
      });

    track = await createTrack(title, artist, artistId, fileUrl, genre, tags);
  });

  test('Non-auth request throws 401 error ', async () => {
    await request(app)
      .post(routeToTest())
      .send({ trackId: track.id })
      .expect(401);
  });

  test('Successful delete should response with 200 success message', async () => {
    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .send({ trackId: track.id })
      .then((res) => {
        expect(res.body).toBeDefined();
        expect(res.body.success).toBeTruthy();
      });
  });
});

describe('POST /user/track/update', () => {
  const routeToTest = () => '/user/track/update';
  const title = 'title 1 ';
  const artist = 'username2';
  const genre = 'rap';
  const tags = 'pop';
  const fileUrl = 'google.com';
  let artistId = null;
  let track;

  beforeAll(async () => {
    const routeForSession = () => '/session/user';

    await request(app)
      .get(routeForSession())
      .set('Cookie', userCookie1)
      .expect(200)
      .then((res) => {
        artistId = res.body.user.id;
      });
    track = await createTrack(title, artist, artistId, fileUrl, genre, tags);
  });

  test('Non-auth request throws 401 error', async () => {
    await request(app).post(routeToTest()).expect(401);
  });

  test('Successfully update should response with success and updated parameters', async () => {
    const newTitle = 'title new';
    const newGenre = 'hip hop';
    const newTags = 'new, 808s';

    await request(app)
      .post(routeToTest())
      .set('Cookie', userCookie1)
      .type('form')
      .field('trackId', track.id.toString())
      .field('title', newTitle)
      .field('genre', newGenre)
      .field('tags', newTags)
      .then((res) => {
        expect(res).toBeDefined();
        expect(res.body).toBeDefined();
        expect(res.body.params).toBeDefined();

        expect(res.body.success).toBeTruthy();
        expect(res.body.params.title).toBe(newTitle);
        expect(res.body.params.genre).toBe(newGenre);
        expect(res.body.params.tags).toBe(newTags);
      });
  });
});

describe('POST /settings/account/deletion', () => {
  const routeToTest = '/settings/account/deletion';

  test('Unauth request should throw 401 error', async () => {
    await request(app).post(routeToTest).expect(401);
  });

  test('Valid auth request should response with a 200 success message', async () => {
    const user = await userSignin(app, username2, password);

    await request(app).post(routeToTest).set('Cookie', user.cookie).expect(200);

    // Check that deleted user is no longer on server
    await getUserData(app, user.user.id, 404);
  });
});
