import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import useDetectOutsideClick from '../shared/useDetectOutsideClick';
import './styles/aside.css';

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

const Header = (props) => {
  const location = useLocation();
  const menuRef = React.useRef();
  const [active, setActive] = useDetectOutsideClick(menuRef);

  // Close menu (mobile view) when route is changed
  React.useEffect(() => {
    if (active) setActive(false);
  }, [location]);

  return (
    <aside className="page-aside">
      <div
        className={`menu ${active ? 'menu-active' : 'menu-collapse'}`}
        ref={menuRef}
      >
        <button
          className={`btn btn--menu ${active ? 'btn--menu--active' : ''}`}
          onClick={() => {
            setActive(!active);
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

        <h4 className="menu__heading">
          <Link to="/" className="menu__title">
            <svg
              className="logo"
              viewBox="0 0 219.24661 220.90758"
              version="1.1"
              id="svg8"
              fill="#2dd760"
            >
              <g
                id="layer3"
                transform="matrix(1.5496245,0,0,1.5496245,-55.485357,-95.82531)"
              >
                <path
                  d="m 98.524268,201.0101 c -2.13179,-0.22447 -6.86687,-1.22552 -9.82693,-2.07751 -11.98471,-3.44956 -22.28424,-9.67583 -31.34001,-18.94565 -7.95051,-8.13844 -12.95319,-16.64688 -16.8562,-28.6686 -1.86588,-5.74711 -1.91117,-6.63721 -0.37979,-7.46405 0.76637,-0.41379 1.60453,-0.45348 7.99981,-0.3788 3.92906,0.0459 8.67563,0.16241 10.54792,0.25896 l 3.40417,0.17556 1.38273,3.83646 c 0.7605,2.11005 1.89376,4.84848 2.51835,6.08541 6.264,12.40509 18.73377,21.34954 33.05863,23.71263 9.339042,1.54061 20.310012,-0.155 28.619452,-4.42327 l 2.6869,-1.38017 -3.40595,-3.33453 C 112.44573,154.2227 75.850988,117.92517 66.235148,108.2013 53.546218,95.369824 50.899268,92.610724 50.899268,92.215604 c 0,-0.834315 5.90407,-6.619875 11.90625,-11.667285 5.12244,-4.30761 13.04268,-8.90187 19.34879,-11.22358 5.03698,-1.85446 10.44771,-3.19132 15.8408,-3.91389 4.211642,-0.56427 13.961492,-0.41698 18.482622,0.27922 7.56619,1.1651 13.99754,3.17942 20.81467,6.51921 13.46215,6.59528 24.58389,17.74075 30.80046,30.866181 2.48227,5.24099 5.73595,14.88597 5.89983,17.48907 l 0.0701,1.11378 -1.98437,0.21199 c -1.09141,0.11659 -5.97297,0.17756 -10.84792,0.13549 -10.65598,-0.092 -10.13724,0.0483 -11.23909,-3.03855 -0.40536,-1.1356 -1.43259,-3.50318 -2.28274,-5.26127 -6.08421,-12.58206 -16.58602,-21.372756 -29.54577,-24.731761 -6.31832,-1.63763 -13.70209,-2.04167 -18.634052,-1.01967 -5.0512,1.04671 -12.29968,3.42624 -14.44929,4.743395 l -0.87698,0.53737 0.78392,0.98569 c 3.50952,4.41281 18.830702,20.172986 49.845382,51.273606 15.24685,15.28909 27.72154,27.86798 27.72154,27.95308 0,0.29132 -11.16938,10.79952 -13.3252,12.53641 -7.8759,6.34539 -18.50542,11.50526 -27.42063,13.31074 -6.80863,1.37886 -18.32499,2.21738 -23.283342,1.69527 z"
                  id="path207"
                />
              </g>
            </svg>
            Snap Music
          </Link>
        </h4>

        <nav className="menu__nav" role="navigation">
          <ul className="menu__list">
            {props.user.authenticated ? (
              <>
                <li className="menu__item">
                  <Link className="transition-colors menu__link" to="/home">
                    <i className="menu__icon fas fa-home" />
                    Home
                  </Link>
                </li>

                <li className="menu__item">
                  <Link className="transition-colors menu__link" to="/chart">
                    <i className="menu__icon fas fa-chart-line" />
                    Charts
                  </Link>
                </li>

                <li className="menu__item">
                  <Link
                    className="transition-colors menu__link"
                    to="/discovery"
                  >
                    <i className="menu__icon fas fa-compass" />
                    Discovery
                  </Link>
                </li>

                <li className="menu__item">
                  <Link
                    className="transition-colors menu__link"
                    to={`/user/${props.user.id}`}
                    data-cy="profile-link"
                  >
                    <i className="menu__icon fas fa-user-circle" />
                    Profile
                  </Link>
                </li>

                <li className="menu__item">
                  <Link className="transition-colors menu__link" to="/upload">
                    <i className="menu__icon fas fa-microphone" />
                    Upload
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="menu__item">
                  <Link className="transition-colors menu__link" to="/chart">
                    Charts
                  </Link>
                </li>

                <li className="menu__item">
                  <Link
                    className="transition-colors menu__link"
                    to="/discovery"
                  >
                    Discovery
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {!props.user.authenticated ? <NoAuthNav /> : null}
      </div>

      <div className={`overlay ${active ? 'overlay--active' : ''}`} />
    </aside>
  );
};

const mapStateToProps = (state) => ({
  user: state.user,
  mediaPlayer: state.mediaPlayer,
});

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
};

export default connect(mapStateToProps, null)(Header);
