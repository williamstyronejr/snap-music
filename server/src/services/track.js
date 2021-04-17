const Track = require('../models/track');
const { deleteFileFirebase } = require('./firebase');

/**
 * Gets the current track by the given user. If user has no tracks, will return
 *  empty array.
 * @param {String} userId Id of user for looking up track
 * @param {Object} projection Object of fields to include/exclude
 * @return {Promise<Object>} Returns a promise to resolve with a track object.
 */
function getCurrentTrack(userId, projection = null) {
  return Track.findOne(
    {
      artistId: userId,
      isExpired: false,
    },
    projection
  ).exec();
}

/**
 * Finds a track by it's id and sets it as expired.
 * @param {String} trackId Id of track to expire
 * @return {Promise<Object>} Returns a promise to resolve with the track.
 *  pre-updated.
 */
function expireTrack(trackId) {
  return Track.findOneAndUpdate(
    { _id: trackId, expirable: false },
    { isExpired: true }
  ).exec();
}

exports.getCurrentTrackByUser = getCurrentTrack;

/**
 * Gets a track from db by id. Projection allows for to select
 * @param {String} trackId Id of track
 * @param {Object} projection Object containing what fields to exclude/include
 * @return {Promise<Object>} Returns a promise to resolve with a track document
 *  from DB.
 */
exports.getTrackById = (trackId, projection = null) => {
  return Track.findById(trackId, projection).exec();
};

/**
 * Gets a list of random tracks matching the given genre. Requires a known/custom
 *  genre to work.
 * @param {String} genre Genre used in search
 * @param {Object} projection Object containing fields to include/exclude
 * @param {Number} limit Number of tracks to get (Default to 10)
 * @return {Promise<Array>} Returns a promises to resolve with an array of
 *  tracks.
 */
exports.getRandomTracksByGenre = (
  genre,
  limit = 10,
  projection = null,
  userId = null
) => {
  return Track.find({ genre, isExpired: false }, projection)
    .limit(limit)
    .exec()
    .then((tracks) => {
      if (!userId) return tracks;

      return tracks.map((track) => {
        return {
          ...track._doc,
          likes: undefined,
          userLikes: !track.likes.every((like) => like.userId !== userId),
        };
      });
    });
};

/**
 * Gets all of the songs listed for a given user in track collection
 *  (non-acrhive). If user has no tracks, will return an empty list.
 * @param {String} userId Id of user to get all tracks.
 * @return {Promise<Array>} Returns a promise to resolve with an array of track
 *  objects.
 */
exports.getAllTracksByUser = (userId) => {
  return Track.find({ artistId: userId }).exec();
};

/**
 * Gets highest voted tracks with option to restrict by a genre.
 *  To get chart across all genres, pass "all" into genre.
 * @param {String} genre Genre to pull track list from
 * @param {Number} limit Number of tracks to get (Defaults to 10)
 * @return {Promise<Array>} Returns a promise to resolve with array of track
 *  objects.
 */
exports.getTopTracksByGenre = (
  genre,
  limit = 10,
  projection = null,
  userId = null
) => {
  const searchParams = { isExpired: false };

  // Only add genre condition if it's not "all genre"
  if (genre !== 'all') searchParams.genre = genre;

  return Track.find(searchParams, projection)
    .sort({ rating: -1 })
    .limit(limit)
    .exec()
    .then((tracks) => {
      if (!userId) return tracks;

      return tracks.map((track) => {
        return {
          ...track.toJSON(),
          userLikes: !track.likes.every((like) => like.userId !== userId),
          likes: undefined,
        };
      });
    });
};

/**
 * Expire user's current track by setting it's expire flag to true. Track will
 *  still need to be archive before deleting.
 * @param {String} userId Id of user to archive current track.
 * @return {Promise<Object>} Returns a promise to resolve with the expired track.
 */
exports.expireCurrentTrack = async (userId) => {
  const track = await getCurrentTrack(userId);

  // User had no track
  if (!track) return null;

  return expireTrack(track.id);
};

/**
 * Creates a new track with given values. Returns promise from mongoose's save
 *  function.
 * @param {String} title Title of track
 * @param {String} artist Artist or username of user uploading track
 * @param {String} artistId User id of user uploading track
 * @param {String} fileUrl Public url to the file
 * @param {String} genre Track's genre
 * @param {String} tags Track's tags stored as string with comma separation
 * @return {Promise<Object>} Returns a promise to resolve with the new track.
 */
exports.createTrack = (
  title,
  artist,
  artistId,
  fileUrl,
  genre,
  tags,
  coverArt = '/img/default_cover.png'
) => {
  return Track({
    title,
    artist,
    artistId,
    fileUrl,
    genre,
    tags,
    coverArt,
  }).save();
};

/**
 * Updates the expires flag for all tracks that have were uploaded more than
 *  24 hrs after current time of running.
 * @param {Object} date Date object used to determine if a track has expired
 * @return {Promise<Object>} A promise to resolve once tracks have been updated.
 */
exports.expireOldTracks = (date) => {
  return Track.find({
    isExpired: false,
    expirable: true,
    meta: { $lte: { created: date } },
  })
    .updateMany({
      isExpired: true,
    })
    .exec();
};

/**
 * Removes all the expired tracks from the track collection.
 * @return {Promise<Object>} A promise to resolve after deleting expried tracks.
 */
exports.removeExpiredTracks = () => {
  return Track.deleteMany({ isExpired: true }).exec();
};

/**
 * Finds and returns a list of all expired tracks.
 * @return {Promise<Object>} Returns a promise to resolve with an list of all
 *  expired tracks if any, otherwise returns an empty list.
 */
exports.findExpiredTracks = () => {
  return Track.find({ isExpired: true }).exec();
};

/**
 * Finds and deletes a track object by the id and deletes the track's
 *  accompanying files if they are not the default files.
 * @param {String} trackId Id of track to be deleted
 * @param {String} userId Id of user
 * @return {Promise<Object>} Returns a promise to resolve with the deleted
 *  track, otherwise with null.
 */
exports.deleteTrackById = (trackId, userId) => {
  return Track.findOneAndDelete({ _id: trackId, artistId: userId })
    .exec()
    .then(async (track) => {
      if (!track) return null;

      let proms = [];
      proms.push(deleteFileFirebase(track.fileUrl));
      if (!track.coverArt.includes('/img/default_cover.png'))
        proms.push(deleteFileFirebase(track.coverArt));

      await Promise.all(proms);
      return track;
    });
};

/**
 * Finds and deletes all tracks by a user.
 * @param {String} userId Id of user
 * @return {Promise<Object>} Returns a promise to resolve with object contain
 *  information about number of tracks deleted.
 */
exports.deleteTracksByUserId = (userId) => {
  return Track.deleteMany({ artistId: userId }).exec();
};

/**
 * Finds and deletes the current (non-expired) track by an user id. Will also
 *  attempt to delete any accompanying files.
 * @param {String} userId Id of user
 * @return {Promise<Object>} Returns a promise to resolve with a deleted track,
 *  or null if no object is found.
 */
exports.deleteActiveTrackByUserId = (userId) => {
  return Track.findOneAndDelete({ artistId: userId, isExpired: false })
    .exec()
    .then(async (track) => {
      if (!track) return null;
      let proms = []; // Array of promises

      // Add promises to delete the track file and the cover (if it exists)
      proms.push(deleteFileFirebase(track.fileUrl));
      if (!track.coverArt.includes('/img/default_cover.png'))
        proms.push(deleteFileFirebase(track.coverArt));

      await Promise.all(proms);
      return track;
    });
};

/**
 * Finds and updates a track by it's id with provided parameters.
 * @param {String} trackId Id of track to be updated
 * @param {Object} param Object of parameter with list
 * @return {Promise<Object>} A promise to resolve with the track if found,
 *  otherwise null.
 */
exports.updateTrack = (trackId, param) => {
  return Track.findByIdAndUpdate(trackId, param).exec();
};

/**
 * Finds and updates a track by it's id.
 * @param {String} trackId Id of track
 * @param {String} userId Id of user
 * @param {Object} params Parameters to update
 * @param {Object} options Query options
 * @return {Promise<Object|Null>} Returns a promise to resolve with a track
 *   object if one is found.
 */
exports.updateTrackById = (trackId, userId, params, options = null) => {
  return Track.findOneAndUpdate(
    { _id: trackId, artistId: userId },
    params,
    options
  );
};

/**
 * Finds and updates a user's current non-expired track with a new artist name.
 * @param {String} userId Id of user
 * @param {String} artist New artist name
 * @param {Object} options Object containing query options
 * @returns {Promise<Object|Null>} Returns a promise to resolve with an track
 *  object if found, otherwise null.
 */
exports.updateTrackAristByUserId = (userId, artist, options = null) => {
  return Track.findOneAndUpdate(
    { artistId: userId, isExpired: false },
    { artist },
    options
  ).exec();
};

/**
 * Adds a like to a track, only if it doesn't exists, and updates the rating.
 * @param {String} trackId Id of track
 * @param {String} userId Id of user liking track
 * @return {Promise<Object>} Returns a promise to resolve with the updated
 *  track object, or null if no match is found.
 */
exports.createLike = (trackId, userId) => {
  return Track.findOneAndUpdate(
    { _id: trackId, 'likes.userId': { $ne: userId } },
    { $push: { likes: { userId } }, $inc: { rating: 1 } },
    { new: true }
  );
};

/**
 * Removes a user's like from a track and updates it rating, only if the user
 *  like already exists.
 * @param {String} trackId Id of a track
 * @param {String} userId Id of an user
 * @return {Promise<Object>} Returns a promise to resolve with the updated
 *  track object, or null if no match is found.
 */
exports.removeLike = (trackId, userId) => {
  return Track.findOneAndUpdate(
    { _id: trackId, 'likes.userId': userId },
    { $inc: { rating: -1 }, $pull: { likes: { userId } } },
    { new: true }
  );
};

/**
 * Finds a track by it's id and returns it only if the user has liked the track.
 * @param {String} trackId Id of track
 * @param {String} userId Id of user
 * @param {Object} projection Object containing which fields to include/exclude
 * @return {Promise<Object>} Returns a promise to resolve with a track if the
 *  user has liked it, otherwise resolves with null.
 */
exports.getUserLike = (trackId, userId, projection = null) => {
  return Track.findOne({ _id: trackId, 'likes.userId': userId }, projection);
};
