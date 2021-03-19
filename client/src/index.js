import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './styles/index.css';
import Root from './components/Root';
import store from './store/store';
import { toggleNightMode, getUserData } from './actions/user';

// Try to get user data if availible
store.dispatch(getUserData());

// Check local storage if night mode is enabled
if (localStorage.getItem('nightMode') === 'true') {
  store.dispatch(toggleNightMode());
}

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById('root')
);
