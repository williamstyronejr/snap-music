import { SETACIVITYDATA } from '../actions/activity';

const initState = {
  feed: [],
};

const activity = (state = initState, action) => {
  switch (action.type) {
    case SETACIVITYDATA:
      return {
        ...state,
        feed: action.payload,
      };

    default:
      return state;
  }
};

export default activity;
