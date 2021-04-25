import { ajaxRequest } from '../utils/utils';
import { setNotificationError } from './notification';

// Action types
export const APPENDPLAYLIST = 'append_playlist';
export const EMPTYPLAYLIST = 'empty_playlist';
export const SETPLAYLIST = 'set_playlist';
export const UPDATEVOTEPLAYLIST = 'update_vote_playlist';
export const SKIPTRACK = 'skip_track';
export const PREVTRACK = 'prev_track';
export const RESTARTPLAYLIST = 'restart_playlist';
export const UPDATETRACKLIKE = 'update_track_like';

export const TOGGLEDISPLAY = 'toggle_display';
export const TOGGLESHUFFLE = 'toggle_shuffle';
export const TOGGLEREPEAT = 'toggle_repeat';
export const TOGGLEMUTE = 'toggle_mute';
export const TOGGLESEEKING = 'toggle_seeking';
export const SETVOLUME = 'set_volume';
export const SETCURRENTTIME = 'set_current_time';
export const SETDUARTION = 'set_duration';
export const REQUESTINGTRACKS = 'requesting_tracks';

/**
 * Redux action creator for flagging that a request is being made.
 * @return {Object} Returns a redux action object.
 */
function requestingTracks() {
  return {
    type: REQUESTINGTRACKS,
  };
}

/**
 * Redux action creator for appending tracks to playlist.
 * @param {Array} tracks Array of track objects
 * @return {Object} Returns a redux action object.
 */
export function appendPlaylist(tracks) {
  return {
    type: APPENDPLAYLIST,
    payload: tracks,
  };
}

/**
 * Redux action creator for setting the playlist. This will replace
 *  previous playlist, and should not be used for empty track lists.
 * @param {array} track Array of tracks
 * @param {String} src Source of playlist
 * @param {Number} currentTrack Index of track to begin playlist on
 * @return {Object} Returns a redux action object.
 */
export function setPlaylist(tracks, src, currentTrack = 0) {
  return {
    type: SETPLAYLIST,
    payload: { tracks, src, currentTrack },
  };
}

/**
 * Redux action creator for emptying the playlist and unsetting current track.
 * @return {Object} Returns a redux action object.
 */
export function emptyPlaylist() {
  return {
    type: EMPTYPLAYLIST,
  };
}

/**
 * Sends a request to get list of random tracks for given genre and add them to
 *  playlist.
 * @param {String} genre Genre to get tracks from
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function getRandomTracks(genre) {
  return (dispatch) => {
    dispatch(requestingTracks());
    ajaxRequest(`/discovery/${genre}/tracks`, 'GET')
      .then((res) => {
        dispatch(setPlaylist(res.data, `/discovery/${genre}`));
      })
      .catch(() => {
        dispatch(
          setNotificationError('A server error has occurred, please try again.')
        );
      });
  };
}

/** Controls for media player */

/**
 * Redux action creator for restarting playlist from initial track.
 * @return {Object} Returns a redux action object.
 */
export function restartPlaylist() {
  return { type: RESTARTPLAYLIST };
}

/**
 * Redux action creator for skipping to the next track.
 * @return {Object} Returns a redux action object.
 */
export function skipTrack() {
  return {
    type: SKIPTRACK,
  };
}

/**
 * Redux action creator for going back to the previous track.
 * @return {Object} Returns a redux action object.
 */
export function prevTrack() {
  return { type: PREVTRACK };
}

/**
 * Redux action creator for toggling repeat song for media player.
 * @return {Object} Returns a redux action object.
 */
export function toggleRepeat() {
  return {
    type: TOGGLEREPEAT,
  };
}

/**
 * Redux action creator for toggling shuffle playlist for media player.
 * @return {Object} Returns a redux action object.
 */
export function toggleShuffle() {
  return {
    type: TOGGLESHUFFLE,
  };
}

/**
 * Redux action creator for toggling the display type of the media player from
 *  footer to full screen.
 * @return {Object} Returns a redux action object.
 */
export function toggleDisplay() {
  return {
    type: TOGGLEDISPLAY,
  };
}

/**
 * Redux action creator for toggling the media player to be mute. This only
 *  mutes the audio, if doesn't not change the volume.
 * @return {Object} Returns a redux action object.
 */
export function toggleMute() {
  return {
    type: TOGGLEMUTE,
  };
}

/**
 * Redux action creator for setting volume for media player. Will also unmute
 *  the media player if muted.
 * @param {Number} vol Amount to set volume to 0 => 100
 * @return {Object} Returns a redux action object.
 */
export function setVolume(vol) {
  return {
    type: SETVOLUME,
    payload: vol,
  };
}

/**
 * Redux action creator for settings the current track's duration (length of
 *  track).
 * @param {Number} duration Duration of track in seconds
 * @return {Object} Returns a redux action object.
 */
export function setDuration(duration) {
  return {
    type: SETDUARTION,
    payload: duration,
  };
}

/**
 * Redux action creator for settings hte current track's current time.
 * @param {Number} time Current time of track in seconds
 * @return {Object} Returns a redux action object.
 */
export function setCurrentTime(time) {
  return {
    type: SETCURRENTTIME,
    payload: time,
  };
}

/**
 * Redux action creator for toggling the seeking flag.
 * @return {Object} Returns a redux action object.
 */
export function toggleSeeking() {
  return {
    type: TOGGLESEEKING,
  };
}

/**
 * Redux action creator for updating current playlist with a user like/unlike
 *  action. Should be called anytime a user likes a track.
 * @param {String} trackId Id of track
 * @param {Boolean} remove Flag indicating if user is liking or unliking a track
 * @return {Object} Returns a redux action object.
 */
export function updateTrackLike(trackId, remove) {
  return {
    type: UPDATETRACKLIKE,
    payload: { trackId, remove },
  };
}
