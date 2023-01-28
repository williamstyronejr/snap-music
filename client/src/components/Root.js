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
import ScrollToTop from './shared/ScrollTop';

// Pages
import DiscoveryPage from './discovery/DiscoveryPage';
import DiscoveryMediaPage from './discovery/DiscoveryMediaPage';
import UserPage from './profile/UserPage';
import UserHomePage from './user/UserHomePage';
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
    <ScrollToTop />
    <MainLayout>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/feed" element={<UserFeedPage />} />
        <Route path="/chart/:genre?" element={<ChartPage />} />
        <Route path="/user/:userId" element={<UserPage />} />
        <Route path="/settings/:type?" element={<SettingsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route exact path="/discovery" element={<DiscoveryPage />} />
        <Route path="/discovery/:genre" element={<DiscoveryMediaPage />} />

        {/* Redirect guest routes to chart page when authenticated */}
        <Route path="/signup" element={<RedirectTo />} />
        <Route path="/signin" element={<RedirectTo />} />
        <Route path="/account/recovery" element={<RedirectTo />} />

        <Route element={<NotFoundPage />} />
      </Routes>
    </MainLayout>
  </Router>
);

const GuestApp = () => (
  <Router>
    <ScrollToTop />
    <MainLayout>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/home" element={<UserHomePage />} />
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
