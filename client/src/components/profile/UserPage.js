import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Track from '../shared/Track';
import ReportUser from './ReportUser';
import FollowButton from '../shared/FollowButton';
import Loading from '../shared/Loading';
import TrackEdit from './TrackEdit';
import {
  getUserData,
  toggleFollow,
  removeTrack,
  updateTrackData,
} from '../../actions/profile';
import { setPlaylist } from '../../actions/mediaPlayer';
import {
  setNotification,
  setNotificationError,
} from '../../actions/notification';
import ConfirmDialog from '../shared/ConfirmDialog';
import useDetectOutsideClick from '../shared/useDetectOutsideClick';
import './styles/userPage.css';

const UserNotFound = () => (
  <section className="user user--missing">
    <p className="user__error">User account not found</p>
  </section>
);

const UserPage = (props) => {
  const menuRef = React.useRef();
  const { userId } = useParams();
  const [editting, setEditting] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [reportVisible, setReportVisible] = React.useState(false);
  const [active, setActive] = useDetectOutsideClick(menuRef);

  // Requests user data for profile everytime the username param changes
  React.useEffect(() => {
    props.getUserData(userId);
  }, [userId]);

  // Check if an error occurred, or if loading
  if (props.profile.error === 404) return <UserNotFound />;
  if (!props.profile.user.username) return <Loading />;

  return (
    <>
      {reportVisible ? (
        <ReportUser
          userId={props.profile.user.id}
          setNotification={props.setNotification}
          setNotificationError={props.setNotificationError}
          onCancel={() => setReportVisible(!reportVisible)}
        />
      ) : null}

      {confirm ? (
        <ConfirmDialog
          message="Are you sure you want to delete you track"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            props.removeTrack(props.profile.track.id);
            setConfirm(false);
          }}
        />
      ) : null}

      <div className="user">
        <section className="user__info">
          <header className="user__header">
            <img
              className="user__pic"
              alt="User Profile"
              src={props.profile.user.profilePicture}
            />
            <h3 className="diplay-name">{props.profile.user.displayName}</h3>
          </header>

          <div className="user__details">
            <h4 className="details__heading">{props.profile.user.bio}</h4>

            <div className="user__stats">
              <span className="user__stat" data-cy="follows">
                {`${props.profile.user.followers} Follower`}
              </span>
              <span className="user__stat">
                {props.profile.user.meta.bestRating || 'No rating'}
              </span>
            </div>
          </div>

          {!props.profile.user.isCurrent ? (
            <div className="user__options">
              <button
                onClick={() => setActive(true)}
                data-cy="profile-menu"
                type="button"
                className="btn btn--inline btn--options"
              >
                ...
              </button>

              {active ? (
                <div className="user__menu" ref={menuRef}>
                  <ul className="user__options-list">
                    <li className="user__options-item">
                      <button
                        className="btn btn--option"
                        type="button"
                        data-cy="report"
                        onClick={() => {
                          setActive(false);
                          setReportVisible(true);
                        }}
                      >
                        Report
                      </button>
                    </li>
                  </ul>
                </div>
              ) : null}

              <FollowButton
                className="btn--inline btn--options"
                isFollowing={props.profile.user.following}
                onClick={() => props.toggleFollow(props.profile.user.id)}
              />
            </div>
          ) : null}
        </section>

        <section className="user__current">
          <h3 className="user__heading">Latest</h3>
          {editting && props.profile.track.artistId === props.user.id ? (
            <TrackEdit
              id={props.profile.track.id}
              initialTitle={props.profile.track.title}
              initialArtist={props.profile.user.username}
              initialTags={props.profile.track.tags}
              initialGenre={props.profile.track.genre}
              initialCoverArt={props.profile.track.coverArt}
              initialExplicit={props.profile.track.explicit}
              onClick={() => {
                props.setPlaylist([props.profile.track]);
              }}
              onSave={props.updateTrackData}
              onCancel={(err) => {
                setEditting(false);
                if (err) {
                  props.setNotificationError(err);
                }
              }}
            />
          ) : (
            <Track
              id={props.profile.track.id}
              playing={
                props.mediaPlayer.playlist.length > 0 &&
                props.mediaPlayer.src === '/user' &&
                props.mediaPlayer.playlist[props.mediaPlayer.currentTrack]
                  .id === props.profile.track.id
              }
              title={props.profile.track.title}
              artist={props.profile.track.artist}
              artistId={props.profile.track.artistId}
              coverArt={props.profile.track.coverArt}
              genre={props.profile.track.genre}
              tags={props.profile.track.tags}
              explicit={props.profile.track.explicit}
              onClick={() => {
                props.setPlaylist([props.profile.track], '/user');
              }}
            />
          )}

          {!editting && props.profile.track.artistId === props.user.id ? (
            <div className="user__track-options">
              <button
                type="button"
                className="btn btn--inline btn--options"
                onClick={() => setEditting(true)}
              >
                Edit
              </button>

              <button
                type="button"
                className="btn btn--inline btn--options"
                onClick={() => setConfirm(true)}
              >
                Remove
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  user: state.user,
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  getUserData: (userName) => dispatch(getUserData(userName)),
  toggleFollow: (userId) => dispatch(toggleFollow(userId)),
  setNotification: (msg) => dispatch(setNotification(msg)),
  setNotificationError: (msg) => dispatch(setNotificationError(msg)),
  setPlaylist: (track) => dispatch(setPlaylist(track)),
  removeTrack: (trackId) => dispatch(removeTrack(trackId)),
  updateTrackData: (data) => dispatch(updateTrackData(data)),
});

UserPage.propTypes = {
  mediaPlayer: PropTypes.shape({
    playlist: PropTypes.array,
    src: PropTypes.string,
    currentTrack: PropTypes.number,
  }).isRequired,
  user: PropTypes.shape({ id: PropTypes.string }).isRequired,
  profile: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string,
      following: PropTypes.bool,
      isCurrent: PropTypes.bool,
      followers: PropTypes.number,
      bio: PropTypes.string,
      displayName: PropTypes.string,
      profilePicture: PropTypes.string,
      meta: PropTypes.shape({
        bestRating: PropTypes.string,
      }),
    }),
    track: PropTypes.shape({
      artistId: PropTypes.string,
      explicit: PropTypes.bool,
      tags: PropTypes.string,
      genre: PropTypes.string,
      coverArt: PropTypes.string,
      id: PropTypes.string,
      title: PropTypes.string,
      artist: PropTypes.string,
    }),
    error: PropTypes.number.isRequired,
  }).isRequired,
  getUserData: PropTypes.func.isRequired,
  toggleFollow: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  setNotificationError: PropTypes.func.isRequired,
  setPlaylist: PropTypes.func.isRequired,
  removeTrack: PropTypes.func.isRequired,
  updateTrackData: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);
