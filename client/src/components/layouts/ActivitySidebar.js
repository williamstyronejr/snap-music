import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { updateActitityData } from '../../actions/activity';
import useOutsideClick from '../shared/useOutsideClick';
import { setPlaylist } from '../../actions/mediaPlayer';
import './styles/sidebar.css';

const ActivitySideBar = (props) => {
  const location = useLocation();
  const [active, setActive] = React.useState(false);
  const ref = useOutsideClick({
    active,
    closeEvent: () => setActive(false),
  });

  React.useEffect(() => {
    props.updateActivity();
  }, []);

  React.useEffect(() => {
    setActive(false);
  }, [location]);

  return (
    <div className="sidebar sidebar--full" ref={ref}>
      <button
        className="btn btn--notification sidebar__toggle"
        type="button"
        onClick={() => {
          setActive((old) => !old);
        }}
      >
        <i className="fas fa-users" />
      </button>

      <div
        className={`sidebar__content ${
          active ? 'sidebar__content--active' : ''
        }`}
      >
        <h3 className="sidebar__heading">Following Activity</h3>

        <ul className="sidebar__list">
          {props.activity.feed.map((user) => (
            <li key={user.id} className="sidebar__item sidebar__item--flex">
              <button
                type="button"
                disabled={user.track === null}
                className={`sidebar__playable ${
                  user.track ? '' : 'sidebar__playable--missing'
                }`}
                onClick={() => {
                  props.setPlaylist([user.track], '/acitivity', 0);
                }}
              >
                <img
                  className="sidebar__image"
                  src={user.profilePicture}
                  alt="User Profile"
                />
              </button>

              <div className="sidebar__message">
                {user.track ? (
                  <>
                    <div className="sidebar__title">{user.track.title}</div>

                    <Link
                      className="transition-colors sidebar__username"
                      to={`/user/${user.id}`}
                    >
                      {user.displayName}
                    </Link>
                  </>
                ) : (
                  <Link
                    to={`/user/${user.id}`}
                    className="transition-colors sidebar__username sidebar__username--title"
                  >
                    {user.displayName}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

ActivitySideBar.propTypes = {
  updateActivity: PropTypes.func.isRequired,
  setPlaylist: PropTypes.func.isRequired,
  activity: PropTypes.shape({
    feed: PropTypes.array.isRequired,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  activity: state.activity,
  // mediaPlayer: state.mediaPlayer
});

const mapDispatchToProps = (dispatch) => ({
  updateActivity: () => dispatch(updateActitityData()),
  setPlaylist: (tracks, src, currentTrack) =>
    dispatch(setPlaylist(tracks, src, currentTrack)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySideBar);
