import { combineReducers } from 'redux';
import mediaPlayer from './mediaReducer';
import chart from './chartReducer';
import profile from './profileReducer';
import notification from './notificationReducer';
import user from './userReducer';
import feed from './feedReducer';

const RootReducer = combineReducers({
  mediaPlayer,
  chart,
  profile,
  notification,
  user,
  feed,
});

export default RootReducer;
