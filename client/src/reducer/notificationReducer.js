import {
  SETNOTIFICATION,
  CLOSENOTIFICATION,
  SETNOTIFICATIONERROR,
  SETNOTIFICATIONS,
  CLEARNOTIFICATIONS,
} from '../actions/notification';

const initState = {
  list: [],
  msg: '',
  visible: false,
  type: null,
};

const notificationReducer = (state = initState, action) => {
  switch (action.type) {
    case SETNOTIFICATIONS:
      return {
        ...state,
        list: action.payload,
      };

    case CLEARNOTIFICATIONS:
      return {
        ...state,
        list: [],
      };

    case SETNOTIFICATIONERROR:
      return {
        ...state,
        msg: action.payload,
        visible: true,
        type: 'error',
      };

    case SETNOTIFICATION:
      return {
        ...state,
        visible: true,
        msg: action.payload,
        type: 'popup',
      };

    case CLOSENOTIFICATION:
      return {
        msg: '',
        visible: false,
        type: null,
      };

    default:
      return state;
  }
};

export default notificationReducer;
