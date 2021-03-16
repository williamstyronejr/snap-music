const router = require('express').Router();
const bodyParser = require('body-parser');
const { loggedIn } = require('../middlewares/user_middleware');
const { validateCharts } = require('../middlewares/validation_middleware');
const {
  discoverByGenre,
  getGenreChart,
  voteTrack,
} = require('../controllers/track');
const { pullGenreData, createGenre } = require('../controllers/genre');

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json({});

// Route for getting random tracks in a genre
router.get('/discovery/:genre/tracks', discoverByGenre);

router.get('/charts/:genre', validateCharts, getGenreChart);

router.post('/track/:id/vote', loggedIn, jsonParser, voteTrack);

// Routes for genres (getting and creating)
router.get('/genres', pullGenreData);

router.post('/genre/create', urlencodedParser, createGenre);

module.exports = router;
