const { getUserFollowingList } = require('../services/follow');
const { getStandardGenres } = require('../services/genre');
const {
  getTopTracksByGenre,
  getTracksByArtists,
  getMostRecentTracks,
} = require('../services/track');
const { getUsersById } = require('../services/user');

exports.getDashboardData = async (req, res, next) => {
  try {
    const topTracks = await getTopTracksByGenre('all', 10);

    const genresList = await getStandardGenres({ name: true });
    const genres = genresList.map((el) => el.name);

    const userIds = topTracks.slice(0, 4).map((track) => track.artistId);
    const trendingArtists = await getUsersById(userIds, {
      profilePicture: true,
      id: true,
      displayName: true,
    });

    const mostRecentTracks = await getMostRecentTracks();
    const [topRapTracks, topRockTracks] = await Promise.all([
      getTopTracksByGenre('rap'),
      getTopTracksByGenre('rock'),
    ]);

    res.json({
      collections: [
        {
          id: 'test',
          title: 'Top Tracks',
          trackList: topTracks,
          artist: 'Snapmusic',
        },
        {
          id: 'test2',
          title: 'New Releases',
          trackList: mostRecentTracks,
          artist: 'Snapmusic',
        },
        {
          id: 'test3',
          title: 'Rap Central',
          trackList: topRapTracks,
          artist: 'Snapmusic',
        },
        {
          id: 'test4',
          title: 'Rock n Roll',
          trackList: topRockTracks,
          artist: 'Snapmusic',
        },
      ],
      genres,
      topTracks,
      trendingArtists,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUserActivityFeed = async (req, res, next) => {
  const { userId } = req.session;

  try {
    const usersFollowing = await getUserFollowingList(userId);
    if (usersFollowing.length === 0) return res.json({ results: [] });

    const followingIds = usersFollowing.map((user) => user.followee.id);

    const trackList = await getTracksByArtists(followingIds, null, 0);
    const entries = new Map(trackList.map((track) => [track.artistId, track]));
    const userTracks = Object.fromEntries(entries);

    const usersWithTracks = [
      ...usersFollowing.map((follow) => ({
        ...follow.followee.toJSON(),
        track: userTracks[follow.followee.id] || null,
      })),
    ];

    return res.status(200).json({
      results: usersWithTracks,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getNotifications = async (req, res, next) => {
  const { userId } = req.session;
  try {
    return res.json({ notifications: [] });
  } catch (err) {
    return next(err);
  }
};

exports.deleteNotifications = async (req, res, next) => {
  const { userId } = req.session;

  try {
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * Gets genre data for all standard genres.
 * @param {Object} req  Response Object
 * @param {Object} res Response Object
 * @param {Function} next Next function to be called
 * @returns
 */
exports.getGenreData = async (req, res, next) => {
  try {
    const genres = await getStandardGenres();

    return res.json({ genres });
  } catch (err) {
    return next(err);
  }
};
