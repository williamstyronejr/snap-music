import {
  UPDATEFOLLOW,
  UPDATETRACK,
  UPDATEUSER,
  SETERROR,
  UPDATETRACKVOTE,
  REMOVETRACK,
  RESETPROFILE,
} from '../actions/profile';

const initState = {
  error: null,
  lastUpdated: null,
  user: {},
  track: {},
};

const userReducer = (state = initState, action) => {
  switch (action.type) {
    case UPDATEUSER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
          error: null,
        },
        lastUpdated: Date.now(),
      };
    case RESETPROFILE:
      return {
        ...initState,
      };

    case UPDATETRACK:
      return {
        ...state,
        track: {
          ...state.track,
          ...action.payload,
        },
      };

    case REMOVETRACK:
      return {
        ...state,
        track: {},
      };

    case UPDATETRACKVOTE:
      if (state.track.id === action.payload.id) {
        return {
          ...state,
          track: {
            ...state,
            votes: action.payload.votes,
          },
        };
      }

      return state;

    case UPDATEFOLLOW:
      return {
        ...state,
        user: {
          ...state.user,
          following: !state.user.following,
          followers: state.user.followers + action.payload,
        },
      };

    case SETERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default userReducer;
