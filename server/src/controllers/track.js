const {
  getCurrentTrackByUser,
  createTrack,
  expireCurrentTrack,
  getRandomTracksByGenre,
  getTopTracksByGenre,
  deleteTrackById,
  updateTrackById,
  createLike,
  removeLike,
} = require('../services/track');
const { cacheChart, getChart } = require('../services/redis');

/**
 * Route handler for liking/unliking a track. Responses with the track's current
 *  rating, if updated.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function
 */
exports.voteTrack = async (req, res, next) => {
  const { userId } = req.session;
  const { id: trackId } = req.params;
  const { remove } = req.body;

  try {
    const track = remove
      ? await removeLike(trackId, userId)
      : await createLike(trackId, userId);

    if (track) return res.json({ success: true, likes: track.rating });
    return res.json({ success: false });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for getting session user's current track. Response with JSON
 *  containing current track info.
 * @param {Object} res Express response object
 * @param {Object} req Express request object
 * @param {Function} next Express next function
 */
exports.getTrackInfo = async (req, res, next) => {
  const { userId } = req.session;

  try {
    const track = await getCurrentTrackByUser(userId);

    return res.json(track);
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for user uploading a track. Will expire user's current track,
 *  then create the new track.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.uploadTrack = async (req, res, next) => {
  const { files, fileLoc } = req;
  const { title, genre, tags } = req.body;
  const { id: userId, displayName } = req.user;

  // Validate file was uploaded
  if (!files || (files && !files.track)) {
    const err = new Error('No track uploaded');
    err.status = 400;
    err.msg = { track: 'No track was uploaded' };
    return next(err);
  }

  try {
    await expireCurrentTrack(userId);

    let trackLocation;
    let coverLocation;

    fileLoc.forEach((file) => {
      if (file.field === 'track') trackLocation = file.fileLocation;
      if (file.field === 'coverArt') coverLocation = file.fileLocation;
    });

    await createTrack(
      title,
      displayName,
      userId,
      trackLocation,
      genre,
      tags,
      coverLocation
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Route handler for getting a discovery track list.
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Express next function to be called
 */
exports.discoverByGenre = (req, res, next) => {
  const { genre } = req.params;
  const { userId } = req.session;
  const projection = {
    fileUrl: true,
    title: true,
    artistId: true,
    coverArt: true,
    rating: true,
    artist: true,
    genre: true,
    likes: { $elemMatch: { userId } },
  };

  getRandomTracksByGenre(genre, 10, projection, userId)
    .then((tracks) => {
      res.json(tracks);
    })
    .catch(next);
};

/**
 * Route handler for getting chart list based on a genre. Responses with a JSON
 *  containing the highest rated tracks for the provided genre.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function to be called
 */
exports.getGenreChart = async (req, res, next) => {
  const { genre } = req.params;
  const { userId } = req.session;
  const projection = {
    fileUrl: true,
    title: true,
    artistId: true,
    coverArt: true,
    rating: true,
    artist: true,
    genre: true,
    explicit: true,
    likes: { $elemMatch: { userId } },
  };

  // try {
  //   const chart = await getChart(genre);
  //   if (chart) return res.json(JSON.parse(chart));
  // } catch (err) {
  //   // Log and continue as if no cache chart exists
  // }

  getTopTracksByGenre(genre, 10, projection, userId)
    .then(async (tracks) => {
      cacheChart(JSON.stringify(tracks), genre).catch((err) => {});
      res.json(tracks);
    })
    .catch(next);
};

/**
 * Route handler for deleting a track.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next function to be called
 */
exports.deleteUserTrack = async (req, res, next) => {
  const { id: userId } = req.user;
  const { trackId } = req.body;

  try {
    const track = await deleteTrackById(trackId, userId);

    // No track was deleted
    if (!track) return res.json({ success: false });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * Route handler for updating a user's track. Responses with success and updated
 *  parameters on successful update.
 * @param {Object} req Request object
 * @param {Object} res Response Object
 * @param {Function} next Next function to be called
 */
exports.updateUserTrack = async (req, res, next) => {
  const { userId } = req.session;
  const { trackId, title, tags, explicit, genre } = req.body;
  const { file, fileLoc } = req;

  const params = Object.assign(
    {},
    file && fileLoc ? { coverArt: fileLoc.fileLocation } : null,
    explicit === 'true' ? { explicit: true } : null,
    explicit === 'false' ? { explicit: false } : null,
    title ? { title } : null,
    genre ? { genre } : null,
    tags ? { tags } : null
  );

  try {
    const track = await updateTrackById(trackId, userId, params, {
      new: true,
    });

    if (!track) return res.json({ sucess: false });

    return res.json({ success: true, params });
  } catch (err) {
    return next(err);
  }
};
