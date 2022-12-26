const http = require('http');
const { setUpJobs } = require('./services/jobs');
const { connectDatabase, disconnectDatabase } = require('./services/database');
const { setupRedis } = require('./services/redis');
const app = require('./services/app');
const logger = require('./services/winston');

const { IP, PORT, DB_URI, REDIS_HOST, REDIS_PORT, REDIS_URL } = process.env;

/**
 * Sets up connects to external services and start corn jobs before starting
 *  server.
 */
async function startServer() {
  try {
    await Promise.all([
      connectDatabase(DB_URI),
      setupRedis(REDIS_PORT, REDIS_HOST, REDIS_URL),
    ]);

    setUpJobs(); // Corn job scheduler

    const server = http.createServer(app);
    server.listen(PORT, IP, () => {
      logger.info(`Server running at ${IP}:${PORT}`);
    });
  } catch (err) {
    logger.error('Crash Error \n', err);

    disconnectDatabase();
    process.exit(0);
  }
}

module.exports = startServer;
