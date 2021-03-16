import { ajaxRequest } from '../utils/utils';

export const SETGENRELIST = 'set_genre_list';

/**
 * Redux action creator for setting genre list.
 * @param {Array} genres Array of strings containing genre names.
 * @return {Object} Returns a redux action object.
 */
function setGenreList(genres) {
  return { type: SETGENRELIST, payload: genres };
}

/**
 * Gets list of non-custom genres from localStorage if saved, otherwise
 *  through request. If error occurs, genre list will only contain 'All'.
 * @return {Function} Returns a function to dispatch a redux action.
 */
export function getGenreList() {
  // Check if genres are stored in cache
  const genres = localStorage.getItem('genres');
  if (genres) {
    return setGenreList(JSON.parse(genres));
  }

  return (dispatch) => {
    ajaxRequest('/genres', 'GET')
      .then((res) => {
        dispatch(setGenreList(res.data));
        localStorage.setItem('genres', JSON.stringify(res.data));
      })
      .catch((err) => {
        // On error, just use all genre as only genre
        const genre = [{ custom: false, name: 'All' }];
        dispatch(setGenreList(genre));
        localStorage.setItem('genres', JSON.stringify(genre));
      });
  };
}
