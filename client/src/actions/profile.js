import { ajaxRequest } from '../utils/utils';
import { setNotificationError } from './notification';

// Action types
export const UPDATEUSER = 'update_user';
export const UPDATETRACK = 'update_track';
export const UPDATETRACKVOTE = 'update_track_vote';
export const UPDATEFOLLOW = 'update_follow';
export const SETERROR = 'set_error';
export const REMOVETRACK = 'remove_track';
export const RESETPROFILE = 'reset_profile';

/**
 * Redux action object creator for updating a user following relationship with
 *  another user.
 * @param {Number} increment Amount to increment the follower count by
 * @return {Object} Returns a redux action object.
 */
function updateFollow(increment) {
  return {
    type: UPDATEFOLLOW,
    payload: increment,
  };
}

/**
 * Redux action creator for setting error when attempting to get user data.
 * @param {Number} code Error status code
 * @return {Object} Returns a redux action object.
 */
function setError(code) {
  return {
    type: SETERROR,
    payload: code,
  };
}

/**
 * Redux action creator for updating user data for profile.
 * @param {Object} data user data
 * @return {Object} Returns a redux action object
 */
export function updateUserData(data) {
  return {
    type: UPDATEUSER,
    payload: data,
  };
}

/**
 * Redux action creator for updating track info for a profile.
 * @param {Object} data Object containing information for track
 * @return {Object} A redux action.
 */
export function updateTrackData(data) {
  return {
    type: UPDATETRACK,
    payload: data,
  };
}

/**
 * Redux action creator for removing current track data.
 * @return {Object} Returns a redux action object.
 */
function removeLocalTrack() {
  return {
    type: REMOVETRACK,
  };
}

/**
 * Redux action creator for resetting profile. Used when getting new user data.
 * @return {Object} Returns a redux action object.
 */
function resetProfile() {
  return {
    type: RESETPROFILE,
  };
}

/**
 * Send request for user data (user & track) and dispatch updates. If the user
 *  isn't found (404), then an dispatch error.
 * @param {String} userName Username to request data
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function getUserData(userName) {
  return (dispatch) => {
    dispatch(resetProfile());
    ajaxRequest(`/user/${userName}/data`, 'GET')
      .then((res) => {
        dispatch(updateUserData(res.data.user));
        dispatch(updateTrackData(res.data.track));
      })
      .catch((err) => {
        // User was not found
        if (err.response && err.response.status === 404) {
          return dispatch(setError(err.response.status));
        }

        dispatch(
          setNotificationError('A Server error has occurred, please try again.')
        );
      });
  };
}

/**
 * Sends a request to follow or unfollow a user and then dispatch an update.
 * @param {String} userId UserId of user being followed/unfollowed
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function toggleFollow(userId) {
  return (dispatch) => {
    ajaxRequest(`/user/${userId}/follow`, 'POST')
      .then((res) => {
        dispatch(updateFollow(res.data.increment));
      })
      .catch((err) => {
        dispatch(
          setNotificationError(
            'There was a problem with following this user. Please try again.'
          )
        );
      });
  };
}

/**
 * Sends a request to remove a user's track. On success, the track will be
 *  removed locally, otherwise a notification will be set.
 * @param {String} trackId Id of track to delete
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function removeTrack(trackId) {
  return (dispatch) => {
    ajaxRequest('/user/track/delete', 'POST', { data: { trackId } })
      .then((res) => {
        dispatch(removeLocalTrack());
      })
      .catch((err) => {
        setNotificationError(
          'There was a problem with deleting the track. Please refresh and try again.'
        );
      });
  };
}
