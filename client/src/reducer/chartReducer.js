import { UPDATECHARTLIKE, SETCHARTLIST } from '../actions/chart';

const initState = {
  visibileList: [],
  lastUpdated: null,
  error: null,
  requesting: false,
};

/**
 * Searchs an array for specific element to update with provided parameter and
 *  returns an updated array.
 * @param {Array} array Array to be updated
 * @param {String} key key (id) of of element to be updated
 * @param {Object} param Parameters to update with
 * @returns {Array} Returns the updated copy of the provided array.
 */
function updateArrayElement(array, key, param) {
  const arr = array.map((elem) => {
    if (elem.id === key) {
      const updatedElem = {
        ...elem,
        ...param,
      };
      return updatedElem;
    }

    return elem;
  });

  return arr;
}

const chartReducer = (state = initState, action) => {
  switch (action.type) {
    case SETCHARTLIST:
      return {
        ...state,
        requesting: false,
        visibileList: action.payload,
        lastUpdated: Date.now(),
      };

    case UPDATECHARTLIKE:
      return {
        ...state,
        visibileList: updateArrayElement(
          state.visibileList,
          action.payload.trackId,
          {
            userLikes: !action.payload.remove,
          }
        ),
      };
    default:
      return state;
  }
};

export default chartReducer;
