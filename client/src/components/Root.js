import * as React from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from 'react-router-dom';
import { connect } from 'react-redux';
import MainLayout from './layouts/MainLayout';

// Pages
import DiscoveryPage from './discovery/DiscoveryPage';
import DiscoveryMediaPage from './discovery/DiscoveryMediaPage';
import UserPage from './profile/UserPage';
import ChartPage from './chart/ChartPage';
import UploadPage from './upload/UploadPage';
import SettingsPage from './settings/SettingsPage';
import NotFoundPage from './NotFoundPage';
import SigninPage from './authentication/SigninPage';
import SignUpPage from './authentication/SignupPage';
import RecoveryPage from './recovery/RecoveryPage';
import HomePage from './home/HomePage';
import AccountResetPage from './recovery/AccountResetPage';
import UserFeedPage from './feed/UserFeedPage';

const RedirectTo = () => <Navigate to="/chart" />;

const AuthApp = () => (
  <Router>
    <MainLayout>
      <Routes>
        <Route exact path="/" component={HomePage} />
        <Route path="/home" component={UserFeedPage} />
        <Route path="/chart" component={ChartPage} />
        <Route path="/user/:userId" component={UserPage} />
        <Route path="/settings/:type?" component={SettingsPage} />
        <Route path="/upload" component={UploadPage} />
        <Route exact path="/discovery" component={DiscoveryPage} />
        <Route path="/discovery/:genre" component={DiscoveryMediaPage} />

        {/* Redirect guest routes to chart page when authenticated */}
        <Route path="/signup" component={RedirectTo} />
        <Route path="/signin" component={RedirectTo} />
        <Route path="/account/recovery" component={RedirectTo} />

        <Route component={NotFoundPage} />
      </Routes>
    </MainLayout>
  </Router>
);

const GuestApp = () => (
  <Router>
    <MainLayout>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/user/:userId" element={<UserPage />} />
        <Route exact path="/discovery" element={<DiscoveryPage />} />
        <Route path="/account/recovery" element={<RecoveryPage />} />
        <Route path="/account/reset" element={<AccountResetPage />} />
        <Route path="/discovery/:genre" element={<DiscoveryMediaPage />} />

        <Route element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  </Router>
);

const Root = (props) => {
  return props.user.authenticated ? <AuthApp /> : <GuestApp />;
};

const mapStateToProps = (state) => ({
  user: state.user,
});

Root.propTypes = {
  user: PropTypes.shape({ authenticated: PropTypes.bool }).isRequired,
};

export default connect(mapStateToProps, null)(Root);
