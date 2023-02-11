const Notification = require('../models/notification');

/**
 * Gets all notification for a user by their id.
 * @param {String} userId User id
 * @returns {Promise<Array<Object>>} Returns an array of notification objects.
 */
exports.getNotificationsForUser = (userId) => {
  return Notification.find({ belongTo: userId }).exec();
};

/**
 * Finds and deletes all notification for a user by the user Id.
 * @param {string} userId User id
 * @returns {Promise<Object>} Returns a promise that resolves with a object
 *  containing number of documents deleted.
 */
exports.deleteAllNotificationForUser = (userId) => {
  return Notification.deleteMany({ belongTo: userId }).exec();
};
