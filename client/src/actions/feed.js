import { ajaxRequest } from '../utils/utils';

export const APPENDTOFEED = 'appendToFeed';
export const PREPENDTOFEED = 'prependToFeed';
export const CLEARFEED = 'clearFeed';
export const UPDATINGFEED = 'updatingFeed';
export const SETFEEDSTATUS = 'setFeedStatus';

/**
 * Redux action creator for appending to the feed.
 * @param {Array} data Array containing list of tracks
 * @returns {Object} Returns a redux action object,
 */
function appendToFeed(data) {
  return {
    type: APPENDTOFEED,
    payload: data,
  };
}

/**
 * Redux action creator for prepending to the feed.
 * @param {Array} data Array containing list of items (tracks)
 * @returns {Object} Returns a redux action object.
 */
function prependToFeed(data) {
  return {
    type: PREPENDTOFEED,
    payload: data,
  };
}

/**
 * Redux action object for clearing the user's feed.
 * @returns {Object} Returns a redux action object.
 */
export function clearFeed() {
  return {
    type: CLEARFEED,
  };
}

/**
 * Redux action creator for setting flag that a request to update feed is being
 *  made.
 * @returns {Object} Returns a redux action object.
 */
export function updatingFeed() {
  return {
    type: UPDATINGFEED,
  };
}

/**
 * Redux action creator for setting the end of the user's feed.
 * @param {Boolean} bool Flag indicating if feed is at the end.
 * @return {Object} Returns a redux action object.
 */
export function setFeedStatus(bool) {
  return {
    type: SETFEEDSTATUS,
    payload: bool,
  };
}

/**
 * Sends a request to get user's feed and updates the feed.
 * @returns {Function} Returns a function to dispatch a redux action.
 */
export function getFeedUpdates() {
  return (dispatch) => {
    dispatch(updatingFeed());
    ajaxRequest('/user/feed', 'GET')
      .then((res) => {
        if (res.data.tracks.length === 0) {
          dispatch(setFeedStatus(true));
        }

        dispatch(prependToFeed(res.data.tracks));
      })
      .catch(() => {});
  };
}
