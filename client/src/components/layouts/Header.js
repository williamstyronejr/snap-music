import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, useResolvedPath } from 'react-router-dom';
import useOutsideClick from '../shared/useOutsideClick';
import NotificationSidebar from './NotificationSidebar';
import ActivitySidebar from './ActivitySidebar';
import { toggleNightMode } from '../../actions/user';
import './styles/header.css';

const Search = () => {
  const [search, setSearch] = React.useState('');

  return (
    <div className="search">
      <div className="search__wrapper">
        <input
          className="transition-colors search__input"
          type="text"
          placeholder="Search ..."
          value={search}
          onChange={(evt) => setSearch(evt.target.value)}
        />

        <i className="transition-colors search__icon fas fa-search" />
      </div>
    </div>
  );
};

const AuthNav = ({
  footer,
  username,
  profileLink,
  toggleDisplayMode,
  nightMode,
  location,
}) => {
  const [active, setActive] = React.useState(false);
  const menuRef = useOutsideClick({
    active,
    closeEvent: () => {
      setActive(false);
    },
  });

  React.useEffect(() => {
    if (active) setActive(false);
  }, [location]);

  const triggerDisplayMode = React.useCallback(() => {
    setActive(false);
    toggleDisplayMode();
  }, [toggleDisplayMode]);

  return (
    <div
      className={`menu-user ${
        active ? 'menu__user--active' : 'menu__user--collapse'
      }`}
      ref={menuRef}
    >
      <div className="menu__info">
        <button
          className="btn"
          type="button"
          data-cy="user-menu"
          onClick={() => setActive(!active)}
        >
          <img className="menu__profile" alt="Profile" src={profileLink} />
        </button>

        <h4 className="menu__username">{username}</h4>
      </div>

      <nav className="menu__nav menu__nav--user shadow--center">
        <ul className="menu__list">
          <li className="menu__item">
            <Link
              className="menu__link menu__link--sub"
              to="/settings"
              data-cy="settings"
            >
              Settings
            </Link>
          </li>

          <li className="menu__item">
            <button
              type="button"
              data-cy="night-mode"
              className={`btn ${
                nightMode ? 'btn--night' : 'btn--light'
              } menu__link menu__link--sub `}
              onClick={triggerDisplayMode}
            >
              {nightMode ? 'Light Mode' : 'Night Mode'}
            </button>
          </li>

          <li className="menu__item">
            <form method="POST" action="/signout">
              <button
                type="submit"
                data-cy="signout"
                className="btn btn--signout menu__link menu__link--sub "
              >
                Signout
              </button>
            </form>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const Header = (props) => {
  const { pathname } = useResolvedPath();

  return (
    <header className="page-header">
      <Search />

      {props.user.authenticated ? (
        <>
          <ActivitySidebar />
          <NotificationSidebar />

          <AuthNav
            footer={
              props.mediaPlayer.footer && props.mediaPlayer.playlist.length > 0
            }
            userId={props.user.id}
            username={props.user.username}
            profileLink={props.user.profilePicture}
            toggleDisplayMode={props.toggleNightMode}
            nightMode={props.user.nightMode}
            location={pathname}
          />
        </>
      ) : null}
    </header>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  mediaPlayer: state.mediaPlayer,
  activity: state.activity,
});

const mapDispatchToProps = (dispatch) => ({
  toggleNightMode: () => dispatch(toggleNightMode()),
});

AuthNav.propTypes = {
  footer: PropTypes.bool.isRequired,
  nightMode: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  profileLink: PropTypes.string.isRequired,
  toggleDisplayMode: PropTypes.func.isRequired,
  location: PropTypes.string.isRequired,
};

Header.propTypes = {
  user: PropTypes.shape({
    nightMode: PropTypes.bool,
    profilePicture: PropTypes.string,
    username: PropTypes.string,
    id: PropTypes.string,
    authenticated: PropTypes.bool,
  }).isRequired,
  mediaPlayer: PropTypes.shape({
    playlist: PropTypes.array,
    footer: PropTypes.bool,
  }).isRequired,
  toggleNightMode: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
