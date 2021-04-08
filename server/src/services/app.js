const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');

const RootRoutes = require('../routes/index');
const { errorHandler } = require('../middlewares/error_middleware');
const winstonConfig = require('./winston');

const { SECRET, DB_URI } = process.env;

const app = express();

// Set up session
app.use(
  session({
    secret: SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    store: MongoStore.create({
      mongoUrl: DB_URI,
    }),
  })
);

// Set up routes
app.use('/img', express.static(path.join(__dirname, '../', 'public', 'img')));

app.use(
  '/static',
  express.static(
    path.join(__dirname, '../', '../', '../', 'client', 'build', '/static')
  )
);

RootRoutes(app);

// Setup error handlers and logger
// app.use(morgan('combined', { stream: winstonConfig.stream }));
app.use(errorHandler);

module.exports = app;
