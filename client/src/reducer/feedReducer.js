import { PREPENDTOFEED, APPENDTOFEED, CLEARFEED } from '../actions/feed';

const initState = {
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
      };
    case APPENDTOFEED:
      return {
        ...state,
        items: [...state.items, ...action.payload],
        lastUpdated: Date.now(),
      };

    case PREPENDTOFEED:
      return {
        ...state,
        items: [...action.payload, ...state.items],
        lastUpdated: Date.now(),
      };
    default:
      return state;
  }
};

export default feedReducer;
