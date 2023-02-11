const router = require('express').Router();
const {
  deleteTrackById,
  expireOldTracks,
  findExpiredTracks,
} = require('../services/track');
const logger = require('../services/winston');

const { SERVERLESS_SECRET } = process.env;

router.post('/cron/delete', async (req, res, next) => {
  const { secret } = req.query;
  if (secret !== SERVERLESS_SECRET) {
    logger.warn('Attemptted access to cron with incorrect secret');
    return res.status(200).json({ success: false });
  }

  try {
    const tracks = await findExpiredTracks();
    let proms = [];

    // Setting delete this way allows for files to be properly deleted.
    tracks.forEach((track) =>
      proms.push(deleteTrackById(track.id, track.artistId))
    );

    await Promise.allSettled(proms);

    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Scheduled Job, Delete Expired, failed', err);
    res.status(200).json({ success: false });
  }
});

router.get('/cron/expire', async (req, res, next) => {
  const { secret } = req.query;
  if (secret !== SERVERLESS_SECRET) {
    logger.warn('Attemptted access to cron with incorrect secret');
    return res.status(200).json({ success: false });
  }

  try {
    const currentTime = new Date();
    currentTime.setDate(currentTime.getDate() - 1);
    await expireOldTracks(currentTime);

    logger.info('Scheduled Job, Expire Tracks, completed');
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error('Scheduled Job, Expire Tracks, failed', err);

    return res.status(200).json({ success: false });
  }
});

module.exports = router;
