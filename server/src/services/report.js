const Report = require('../models/report');

/**
 * Creates a report in the database.
 * @param {string} sender The id of the user making the report
 * @param {string} recipient The id of the user the report is against
 * @param {boolean} profile Indicator if user is reporting the profile
 * @param {boolean} track  Indicator if user is reporting the track
 * @param {string} message Optional message from sender detailing why they are
 *  reporting.
 * @return {promise} A promise that resolves with the report or reject with an
 *  error from mongoose.
 */
exports.createReport = (sender, recipient, profile, track, message) =>
  Report({
    sender,
    recipient,
    profile,
    track,
    message
  }).save();

/**
 * Deletes a report by it id.
 * @param {string} reportId Id of the report to be deleted.
 * @return {promise} A promise to resolve after deleting the document or reject
 *  if an error occurs in mongoose.
 */
exports.deleteReport = reportId => Report.deleteOne({ _id: reportId }).exec();

/**
 * Deletes all report for a given user.
 * @param {string} userId Id of user to deleted all reports against.
 * @return {promise} A promise to resolve after deleting all the reports or
 *  reject if an error occurs.
 */
exports.deleteAllUserReport = userId =>
  Report.deleteMany({ recipient: userId }).exec();
