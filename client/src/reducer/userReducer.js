import {
  TOGGLENIGHTMODE,
  SETAUTHERROR,
  SETAUTHDATA,
  AUTHENTICATING,
  UPDATEUSERDATA,
  UNAUTHUSER,
} from '../actions/user';

const initState = {
  // Authentication stuff
  authenticating: false,
  authenticated: false,
  authenticationError: null,

  // User information "stuff"
  nightMode: false,
  id: null,
  username: null,
  displayName: null,
  email: null,
  profilePicture: null,
};

const userReducer = (state = initState, action) => {
  switch (action.type) {
    case AUTHENTICATING:
      return {
        ...state,
        authenticating: action.payload,
        authenticated: false,
        authenticationError: null,
      };

    case SETAUTHERROR:
      return {
        ...state,
        authenticating: false,
        authenticated: false,
        authenticationError: action.payload,
      };

    case SETAUTHDATA:
      return {
        ...state,
        id: action.payload.id,
        displayName: action.payload.displayName,
        username: action.payload.username,
        email: action.payload.email,
        bio: action.payload.bio,
        profilePicture: action.payload.profilePicture,
        authenticating: false,
        authenticated: true,
      };

    case UNAUTHUSER:
      return {
        ...initState,
        nightMode: state.nightMode,
      };

    case TOGGLENIGHTMODE:
      // Set theme preference in local storage
      localStorage.setItem('nightMode', !state.nightMode);
      return {
        ...state,
        nightMode: !state.nightMode,
      };

    case UPDATEUSERDATA:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

export default userReducer;
