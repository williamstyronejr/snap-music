import { combineReducers } from 'redux';
import mediaPlayer from './mediaReducer';
import chart from './chartReducer';
import profile from './profileReducer';
import notification from './notificationReducer';
import user from './userReducer';
import genre from './genreReducer';

const RootReducer = combineReducers({
  mediaPlayer,
  chart,
  profile,
  notification,
  user,
  genre,
});

export default RootReducer;
