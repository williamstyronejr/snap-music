const path = require('path');
const trackRouter = require('./track');
const userRouter = require('./user');

module.exports = function router(app) {
  // Setting up app routes
  app.use(userRouter);
  app.use(trackRouter);

  // Default to react app
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public/index.html'));
  });
};
