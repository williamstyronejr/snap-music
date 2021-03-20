require('dotenv').config();
const http = require('http');
const jobs = require('./services/jobs');
const { connectDatabase, disconnectDatabase } = require('./services/database');
const { setupRedis } = require('./services/redis');
const app = require('./services/app');
const logger = require('./services/winston');

const { IP, PORT, DB_URI, REDIS_HOST, REDIS_PORT, REDIS_URL } = process.env;

// Connect to Database
connectDatabase(DB_URI)
  .then(() => {
    setupRedis(REDIS_PORT, REDIS_HOST, REDIS_URL).then(() => {
      // Set up scheduler
      jobs.setUpJobs();

      // Create http server
      const server = http.createServer(app);
      server.listen(PORT, IP, () => {
        console.log(`Server running at ${IP}:${PORT}`);
      });
    });
  })
  .catch((err) => {
    // Log server breaking error, even on production
    disconnectDatabase();
    logger.debug(err.message);
    process.exit(1);
  });
