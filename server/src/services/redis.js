const { promisify } = require('util');
const redis = require('redis');

let client;

/**
 * Sets up connection with redis server and events on non-production runs.
 */
exports.setupRedis = (port, host) => {
  client = redis.createClient(port, host);

  return new Promise((res, rej) => {
    client.on('connect', () => {
      if (process.NODE_ENV !== 'production') {
        console.log('Redis server is connected');
      }

      client.get = promisify(client.get).bind(client);
      client.set = promisify(client.set).bind(client);
      client.expire = promisify(client.expire).bind(client);
    });

    client.on('ready', () => {
      // Requires redis client to be version 5
      if (client.server_info.versions[0] < 5) {
        return rej(new Error('Requires redis version >= 5.'));
      }

      return res(client);
    });
  });
};

/**
 * Clears redis database.
 */
exports.flushRedis = () => {
  client.flushall();
};

/**
 * Close redis connection using quit method (Quit closes connection after
 *  pending request are completed).
 */
exports.closeConnection = () => {
  if (client) return client.quit();
};

/**
 * Gets cache version of list from redis. Chart will be return as a string
 *  and will need to be convert back into an object.
 * @param {string} genre Genre of chart to get
 * @return {Promise} A promise to resolve with a string of the cached chart.
 */
exports.getChart = (genre) => client.get(`chart-${genre}`);

/**
 * Caches the chart data and gives it a expires timer using redis. Chart must
 *  be a type of string to work with redis.
 * @param {string} chart Chart with track data in string form.
 * @param {string} genre Genre of chart to be stored
 * @param {number} ttl Number of seconds to keep cache chart for (default = 300)
 * @return {Promise} A promise to resolve with integer to indicate if the key's
 *  timeout was set.
 */
exports.cacheChart = (chart, genre, ttl = 300) =>
  client
    .set(`chart-${genre}`, chart)
    .then(() => client.expire(`chart-${genre}`, ttl));
