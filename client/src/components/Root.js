import * as React from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
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

const RedirectTo = () => <Redirect to="/chart" />;

const AuthApp = () => (
  <Router>
    <MainLayout>
      <Switch>
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
      </Switch>
    </MainLayout>
  </Router>
);

const GuestApp = () => (
  <Router>
    <MainLayout>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/signin" component={SigninPage} />
        <Route path="/chart" component={ChartPage} />
        <Route path="/user/:userId" component={UserPage} />
        <Route exact path="/discovery" component={DiscoveryPage} />
        <Route path="/account/recovery" component={RecoveryPage} />
        <Route path="/account/reset" component={AccountResetPage} />
        <Route path="/discovery/:genre" component={DiscoveryMediaPage} />

        <Route component={NotFoundPage} />
      </Switch>
    </MainLayout>
  </Router>
);

const Root = (props) => {
  return <>{props.user.authenticated ? <AuthApp /> : <GuestApp />}</>;
};

const mapStateToProps = (state) => ({
  user: state.user,
});

Root.propTypes = {
  user: PropTypes.shape({ authenticated: PropTypes.bool }).isRequired,
};

export default connect(mapStateToProps, null)(Root);
