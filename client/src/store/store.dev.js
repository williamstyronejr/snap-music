import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from '../reducer/index';

const store = createStore(
  rootReducer,
  {},
  applyMiddleware(
    //
    createLogger(),
    thunk
  )
);

export default store;
