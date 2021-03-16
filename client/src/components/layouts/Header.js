import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { toggleNightMode } from '../../actions/user';
import useDetectOutsideClick from '../shared/useDetectOutsideClick';
import './styles/header.css';

const NoAuthNav = () => (
  <nav className="menu__nav">
    <ul className="menu__list">
      <li className="menu__item">
        <Link className="menu__link" to="/signin" data-cy="signin">
          Sign In
        </Link>
      </li>

      <li className="menu__item">
        <Link className="menu__link" to="/signup" data-cy="signup">
          Sign Up
        </Link>
      </li>
    </ul>
  </nav>
);

const AuthNav = ({
  footer,
  username,
  profileLink,
  toggleNightMode,
  nightMode,
  location,
}) => {
  const menuRef = React.useRef();
  const [active, setActive] = useDetectOutsideClick(menuRef);

  React.useEffect(() => {
    if (active) setActive(false);
  }, [location]);

  const triggerDisplayMode = () => {
    setActive(false);
    toggleNightMode();
  };

  return (
    <div
      className={`menu__user ${footer ? 'menu__user--footer' : ''} ${
        active ? 'menu__user--active' : 'menu__user--collapse'
      }`}
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

      <nav className="menu__nav menu__nav--user" ref={menuRef}>
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

          <div className="menu__divider"></div>

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
  const [expand, setExpand] = React.useState(false);

  // Close menu (mobile view) when route is changed
  React.useEffect(() => {
    if (expand) setExpand(false);
  }, [props.location.pathname]);

  return (
    <header className="page-header">
      <div className={`menu ${expand ? 'menu-active' : 'menu-collapse'}`}>
        <button
          className={`btn btn--menu ${expand ? 'btn--menu--active' : ''}`}
          onClick={() => {
            setExpand(!expand);
          }}
          type="button"
          role="menu"
        >
          <div className="menu__toggle">
            <span className="menu__bar menu__bar--1" />
            <span className="menu__bar menu__bar--2" />
            <span className="menu__bar menu__bar--3" />
          </div>
        </button>

        <h4 className="menu__heading">Snap Music</h4>

        <nav className="menu__nav" role="navigation">
          <ul className="menu__list">
            <li className="menu__item">
              <Link className="menu__link" to="/chart">
                Charts
              </Link>
            </li>

            <li className="menu__item">
              <Link className="menu__link" to="/discovery">
                Discovery
              </Link>
            </li>

            {props.user.authenticated ? (
              <>
                <li className="menu__item">
                  <Link
                    className="menu__link"
                    to={`/user/${props.user.username}`}
                  >
                    Profile
                  </Link>
                </li>

                <li className="menu__item">
                  <Link className="menu__link" to="/upload">
                    Upload
                  </Link>
                </li>
              </>
            ) : null}
          </ul>
        </nav>

        {!props.user.authenticated ? <NoAuthNav /> : null}

        {props.user.authenticated && (
          <AuthNav
            footer={
              props.mediaPlayer.footer && props.mediaPlayer.playlist.length > 0
            }
            username={props.user.username}
            profileLink={props.user.profilePicture}
            toggleNightMode={props.toggleNightMode}
            nightMode={props.user.nightMode}
            location={props.location.pathname}
          />
        )}
      </div>

      <div
        className={`overlay ${expand ? 'overlay--active' : ''}`}
        onClick={() => {
          setExpand(!expand);
        }}
      />
    </header>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  toggleNightMode: () => dispatch(toggleNightMode()),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
