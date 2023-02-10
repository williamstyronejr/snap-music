const {
  getDashboardData,
  getUserActivityFeed,
  getNotifications,
  deleteNotifications,
  getGenreData,
} = require('../controllers/api');
const { loggedIn, getCurrentUser } = require('../middlewares/user_middleware');

const router = require('express').Router();

router.get('/api/genres', getGenreData);

router.get('/api/dashboard', getDashboardData);

router.get('/api/activity', loggedIn, getCurrentUser, getUserActivityFeed);

router.get('/api/notifications', loggedIn, getCurrentUser, getNotifications);

router.post(
  '/api/notifications/clear',
  loggedIn,
  getCurrentUser,
  deleteNotifications
);

module.exports = router;
