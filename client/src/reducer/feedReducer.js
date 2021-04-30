import {
  PREPENDTOFEED,
  APPENDTOFEED,
  CLEARFEED,
  UPDATINGFEED,
} from '../actions/feed';

const initState = {
  requesting: false,
  items: [],
  lastUpdated: Date.now(),
};

const feedReducer = (state = initState, action) => {
  switch (action.type) {
    case CLEARFEED:
      return {
        ...state,
        items: [],
        lastUpdated: Date.now(),
        requesting: false,
      };
    case APPENDTOFEED:
      return {
        ...state,
        items: [...state.items, ...action.payload],
        lastUpdated: Date.now(),
        requesting: false,
      };

    case PREPENDTOFEED:
      return {
        ...state,
        items: [...action.payload, ...state.items],
        lastUpdated: Date.now(),
        requesting: false,
      };

    case UPDATINGFEED:
      return {
        ...state,
        requesting: true,
      };
    default:
      return state;
  }
};

export default feedReducer;
