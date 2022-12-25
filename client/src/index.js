import React from 'react';
import { createRoot } from 'react-dom/client';
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

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <Root />
  </Provider>
);
