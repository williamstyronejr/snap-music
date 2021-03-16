require('dotenv').config();
const {
  setupRedis,
  flushRedis,
  closeConnection,
  cacheChart,
  getChart,
} = require('../redis');

const { REDIS_HOST, REDIS_PORT } = process.env;

beforeAll(async () => {
  await setupRedis(REDIS_PORT, REDIS_HOST);
}, 10000);

afterAll((done) => {
  closeConnection();
  setTimeout(() => {
    done();
  }, 500);
});

afterEach(() => {
  flushRedis();
});

describe('Caching chart', () => {
  const testChart = [{ name: 'track1' }, { name: 'track2' }];
  const genre = 'test';

  test('Charts by genre', async () => {
    await cacheChart(JSON.stringify(testChart), genre, 1);
    const chart = await getChart(genre);
    expect(JSON.parse(chart)[0].name).toBe(testChart[0].name);
  });

  test('Chart expires properly', async (done) => {
    await cacheChart(JSON.stringify(testChart), genre, 1);
    setTimeout(async () => {
      const chart = await getChart(genre);
      expect(chart).toBe(null);
      done();
    }, 1500);
  });
});
