import { ajaxRequest } from '../utils/utils';
import { setNotificationError } from './notification';
import { updateTrackLike } from './mediaPlayer';
import { updateChartLike } from './chart';

export const UPDATETRACK = 'updateTrack';

/**
 * Sends a request to like or unlike track and then dispatch to update the
 *  current chart list and track list in the media player.
 * @param {String} trackId Id of track
 * @param {Boolean} remove Flag indicating if the user is unliking the track.
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function likeTrack(trackId, remove = false) {
  return (dispatch) => {
    ajaxRequest(`/track/${trackId}/vote`, 'POST', { data: { remove } })
      .then((res) => {
        if (res.data.success) {
          dispatch(updateTrackLike(trackId, remove));
          dispatch(updateChartLike(trackId, remove));
        }
      })
      .catch(() => {
        dispatch(
          setNotificationError(
            'An error occurred when updating like, please try again.'
          )
        );
      });
  };
}
