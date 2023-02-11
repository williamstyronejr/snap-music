const path = require('path');
const trackRouter = require('./track');
const userRouter = require('./user');
const cronRouter = require('./cron');

const { SERVERLESS } = process.env;

module.exports = function router(app) {
  // Setting up app routes
  app.use(userRouter);
  app.use(trackRouter);
  if (SERVERLESS === 'true') app.use(cronRouter);

  // Default to react app
  app.use('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../', '../', 'public', 'index.html'));
  });
};
