const { promisify } = require('util');
const redis = require('redis');

let client;

/**
 * Sets up connection with redis server and events on non-production runs. WIll
 *  use URL for connection if provided, otherwise uses hostname and port.
 * @param {Number} port Port of redis server
 * @param {String} host Host of redis server
 * @param {String} URL Redix URL connection
 * @returns {Promise<Object>} Returns a promise to resolve with a redis client
 *  object.
 */
exports.setupRedis = (port = 6379, host = 'localhost', URL = null) => {
  client = URL ? redis.createClient(URL) : redis.createClient(port, host);

  return new Promise((res, rej) => {
    client.on('connect', () => {
      client.get = promisify(client.get).bind(client);
      client.set = promisify(client.set).bind(client);
      client.expire = promisify(client.expire).bind(client);
    });

    // On connection ready
    client.on('ready', () => {
      // Requires redis client to be version 5
      if (client.server_info.versions[0] < 5) {
        return rej(new Error('Requires redis version >= 5.'));
      }

      return res(client);
    });

    // On connection error
    client.on('error', rej);
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
