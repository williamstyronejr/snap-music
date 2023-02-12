const schedule = require('node-schedule');
const {
  deleteTrackById,
  expireOldTracks,
  findExpiredTracks,
} = require('./track');
const logger = require('./winston');

const { SERVERLESS } = process.env;

/**
 * Finds and deletes all track that are set as expired.
 */
async function deleteExpiredTracks() {
  try {
    const tracks = await findExpiredTracks();
    let proms = [];

    // Setting delete this way allows for files to be properly deleted.
    tracks.forEach((track) =>
      proms.push(deleteTrackById(track.id, track.artistId))
    );

    await Promise.allSettled(proms);
  } catch (err) {
    logger.error('Corn', err);
  }
}

/**
 * Finds all tracks that have been posted 24hrs+ and aren't marked as expired.
 */
async function updateExpiredTracks() {
  try {
    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 1);

    await expireOldTracks(currentTime);
  } catch (err) {
    logger.error('Corn', err);
  }
}

/**
 * Schedules corn jobs for deleting tracks and removing files form firebase.
 */
exports.setUpJobs = () => {
  if (SERVERLESS === 'true') return;

  logger.info('Crons Jobs Scheduled');

  schedule.scheduleJob('* */1 * * *', updateExpiredTracks);

  // Deletes expired tracks twice a day
  schedule.scheduleJob('0 0 * * *', deleteExpiredTracks);
};
