const Follow = require('../models/follow');

/**
 * Creates a new follower-following relation.
 * @param {String} followee Id of user that is being followed
 * @param {String} follower Id of user that is following
 * @return {Promise<Object>} Returns a promise to resolve with an follow object.
 */
exports.createFollow = (followee, follower) => {
  return Follow({ followee, follower }).save();
};

/**
 * Removes and returns an follow relation object between two users.
 * @param {String} followee Id of user that is being followed
 * @param {String} follower Id of user that is following
 * @return {Promise<Object>} Returns a promise to resolve with a follow object.
 */
exports.removeFollowing = (followee, follower) => {
  return Follow.findOneAndDelete({ followee, follower }).exec();
};

/**
 * Removes all following relations with a particular user, in case of account
 *  deletion.
 * @param {String} follower Id of user to destory all following relations with
 * @return {Promise<Object>} Returns a promise to resolve an array of follow
 *  objects.
 */
exports.removeAllFollowing = (follower) => {
  return Follow.deleteMany({ follower }).exec();
};

/**
 * Gets and returns following relationship between to users, if one exists.
 * @param {String} followee Id of user that is following someone
 * @param {String} follower Id of user that is being followed
 * @return {Promise<Object>} Returns a promise to resolve with a follow object
 *  if found.
 */
exports.getFollowRelation = (followee, follower) => {
  return Follow.findOne({ followee, follower }).exec();
};
