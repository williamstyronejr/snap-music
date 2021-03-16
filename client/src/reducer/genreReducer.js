import { SETGENRELIST } from '../actions/genre';

const initState = {
  genres: [],
};

const genreReducer = (state = initState, action) => {
  switch (action.type) {
    case SETGENRELIST:
      return {
        ...state,
        genres: action.payload,
      };
    default:
      return state;
  }
};

export default genreReducer;
