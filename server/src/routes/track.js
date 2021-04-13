const router = require('express').Router();
const bodyParser = require('body-parser');
const { loggedIn } = require('../middlewares/user_middleware');
const { validateCharts } = require('../middlewares/validation_middleware');
const {
  discoverByGenre,
  getGenreChart,
  voteTrack,
} = require('../controllers/track');
const { pullGenreData } = require('../controllers/genre');

const jsonParser = bodyParser.json({});

// Route for getting random tracks in a genre
router.get('/discovery/:genre/tracks', discoverByGenre);

router.get('/charts/:genre', validateCharts, getGenreChart);

router.post('/track/:id/vote', loggedIn, jsonParser, voteTrack);

// Routes for genres (getting and creating)
router.get('/genres', pullGenreData);

module.exports = router;
