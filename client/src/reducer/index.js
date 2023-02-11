import { combineReducers } from 'redux';
import mediaPlayer from './mediaReducer';
import chart from './chartReducer';
import profile from './profileReducer';
import notification from './notificationReducer';
import user from './userReducer';
import feed from './feedReducer';
import dashboard from './dashboardReducer';
import activity from './activityReducer';

const RootReducer = combineReducers({
  mediaPlayer,
  chart,
  profile,
  notification,
  user,
  feed,
  dashboard,
  activity,
});

export default RootReducer;
