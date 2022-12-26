const { promisify } = require('util');
const redis = require('redis');
const logger = require('./winston');

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
exports.setupRedis = async (port = 6379, host = 'localhost', URL = null) => {
  client = redis.createClient({ url: URL ? URL : '' });
  try {
    await client.connect();
    logger.info(`Connecting redis at ${URL ? URL : `${host}:${port}`}`);
  } catch (err) {
    logger.error(`Redis connection error`);
    throw err;
  }
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
