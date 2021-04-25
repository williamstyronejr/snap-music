import { ajaxRequest } from '../utils/utils';
import { setNotificationError } from './notification';

export const UPDATECHARTLIKE = 'update_chart_like';
export const SETCHARTLIST = 'set_chart_list';
export const SETREQUSETING = 'set_requesting';

/**
 * Redux action creator for setting request state.
 * @param {Boolean} requesting Flag indicating if the chart is being requested
 * @returns {Object} Returns a redux action object.
 */
export function setRequesting(requesting) {
  return {
    type: SETREQUSETING,
    payload: requesting,
  };
}

/**
 * Redux action creator for setting the chart list tracks.
 * @param {Array} tracks List of tracks
 * @returns {Object} Returns a redux action object.
 */
export function setChartList(tracks) {
  return {
    type: SETCHARTLIST,
    payload: tracks,
  };
}

/**
 * Redux action creator for updating chart list with a user's like or unlike.
 * @param {String} trackId Id of a track
 * @param {Boolean} likedTrack Flag indicating if the user is liking or unliking
 * @return {Object} Returns a redux action object.
 */
export function updateChartLike(trackId, likedTrack) {
  return {
    type: UPDATECHARTLIKE,
    payload: { trackId, likedTrack },
  };
}

/**
 * Makes a request to get top chart data for a specific genre and
 *  dispatches update action. Errors messages are handled by notifications.
 * @param {String} genre Genre to search
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function getChartList(genre) {
  return (dispatch) => {
    dispatch(setRequesting(true));
    ajaxRequest(`/charts/${genre}`)
      .then((res) => {
        dispatch(setChartList(res.data));
      })
      .catch(() => {
        dispatch(setRequesting(false));
        dispatch(
          setNotificationError('An error has occured, try reloading the page.')
        );
      });
  };
}
