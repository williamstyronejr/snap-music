const {
  getDashboardData,
  getUserActivityFeed,
  getNotifications,
  deleteNotifications,
} = require('../controllers/api');
const { loggedIn, getCurrentUser } = require('../middlewares/user_middleware');

const router = require('express').Router();

router.get('/api/dashboard', getDashboardData);

router.get('/api/activity', loggedIn, getCurrentUser, getUserActivityFeed);

router.get('/api/notifications', loggedIn, getCurrentUser, getNotifications);
router.post(
  '/api/notifications',
  loggedIn,
  getCurrentUser,
  deleteNotifications
);

module.exports = router;
