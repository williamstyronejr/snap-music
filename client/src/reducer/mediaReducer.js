import {
  APPENDPLAYLIST,
  SETPLAYLIST,
  EMPTYPLAYLIST,
  UPDATEVOTEPLAYLIST,
  SKIPTRACK,
  PREVTRACK,
  RESTARTPLAYLIST,
  TOGGLEREPEAT,
  TOGGLESHUFFLE,
  TOGGLEDISPLAY,
  TOGGLEMUTE,
  SETVOLUME,
  SETDUARTION,
  SETCURRENTTIME,
  TOGGLESEEKING,
  REQUESTINGTRACKS,
  UPDATETRACKLIKE,
} from '../actions/mediaPlayer';

const initState = {
  footer: true,
  requesting: false,
  src: '', // Source of tracklist ('discovery' or 'user' or 'chart')

  playlist: [],
  currentTrack: 0,
  shuffle: false,
  repeat: false,
  muted: false,
  volume: 50,
  seeking: false,
  currentTime: 0,
  duration: 0,
};

function updateArrayElement(array, key, param) {
  const t = array.map((elem) => {
    if (elem.id === key) {
      const test = {
        ...elem,
        ...param,
      };
      return test;
    }

    return elem;
  });
  return t;
}

const mediaPlayer = (state = initState, action) => {
  switch (action.type) {
    case REQUESTINGTRACKS:
      return {
        ...state,
        requesting: true,
      };
    case APPENDPLAYLIST:
      return {
        ...state,
        playlist: state.playlist.slice().push(action.payload),
      };

    case SETPLAYLIST:
      return {
        ...state,
        requesting: false,
        playlist: action.payload.tracks,
        src: action.payload.src,
        currentTrack: action.payload.currentTrack,
      };

    case EMPTYPLAYLIST:
      return {
        ...state,
        playlist: [],
        currentTrack: 0,
      };

    case UPDATEVOTEPLAYLIST:
      if (state.playlist[state.currentTrack].id === action.payload.trackId) {
        return {
          ...state,
          playlist: updateArrayElement(
            state.playlist,
            action.payload.trackId,
            action.payload.votes
          ),
        };
      }

      return state;

    case UPDATETRACKLIKE:
      return {
        ...state,
        playlist: updateArrayElement(state.playlist, action.payload.trackId, {
          userLikes: !action.payload.remove,
        }),
      };
    case SKIPTRACK:
      return {
        ...state,
        currentTrack: state.currentTrack + 1,
        repeat: false,
      };
    case PREVTRACK:
      return {
        ...state,
        currentTrack: state.currentTrack - 1,
      };

    case RESTARTPLAYLIST:
      return {
        ...state,
        currentTrack: 0,
        repeat: false,
      };

    case TOGGLEREPEAT:
      return {
        ...state,
        repeat: !state.repeat,
      };

    case TOGGLESHUFFLE:
      return {
        ...state,
        shuffle: !state.shuffle,
      };

    case TOGGLEDISPLAY:
      return {
        ...state,
        footer: !state.footer,
      };

    case TOGGLEMUTE:
      return {
        ...state,
        muted: !state.muted,
      };

    case SETVOLUME:
      return {
        ...state,
        muted: false,
        volume: action.payload,
      };
    case SETDUARTION:
      return {
        ...state,
        duration: action.payload,
      };

    case SETCURRENTTIME:
      return {
        ...state,
        currentTime: action.payload,
      };
    case TOGGLESEEKING:
      return {
        ...state,
        seeking: !state.seeking,
      };
    default:
      return state;
  }
};

export default mediaPlayer;
