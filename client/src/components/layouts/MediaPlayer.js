import * as React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Loading from '../shared/Loading';
import { likeTrack } from '../../actions/track';
import {
  skipTrack,
  prevTrack,
  restartPlaylist,
  toggleRepeat,
  toggleShuffle,
  toggleMute,
  toggleSeeking,
  setVolume,
  setDuration,
  setCurrentTime,
} from '../../actions/mediaPlayer';
import './styles/mediaPlayer.css';

function changeToTime(time) {
  return new Date(time * 1000).toISOString().substr(14, 5);
}

const MediaPlayer = (props) => {
  const audioRef = React.useRef(null);
  const {
    currentTrack,
    repeat,
    shuffle,
    playlist,
    footer,
    muted,
    volume,
    currentTime,
    duration,
    seeking,
    src,
    requesting,
  } = props.mediaPlayer;

  React.useEffect(() => {
    // Load new audio on changes to playlist
    if (audioRef.current) audioRef.current.load();
  }, [src, currentTrack]);

  if (requesting && !footer) return <Loading />;
  if (playlist.length === 0) return null;

  const { title, artist, artistId, id, coverArt, fileUrl, userLikes } =
    playlist[currentTrack];

  /**
   * Toggles audio element's to be paused or play
   */
  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  /**
   * Handles previous button by reloading the track, or if the track just
   *  started, going to the previous track if there is is one.
   */
  const prevTrack = () => {
    if (audioRef.current.currentTime < 3 && currentTrack !== 0) {
      props.prevTrack();
    }
    audioRef.current.load();
    audioRef.current.play();
  };

  /**
   * Skip to next track and then reloads and plays the audio element. If at end
   *  of playlist, than restarts the playlist.
   */
  const nextTrack = () => {
    if (currentTrack + 1 >= playlist.length) {
      props.restartPlaylist();
      audioRef.current.load();
      audioRef.current.pause();
    } else {
      props.skipTrack();
      audioRef.current.load();
    }
  };

  /**
   * Toggles the audio element's muted prop and updates the mediaPlayer state.
   */
  const mute = () => {
    audioRef.current.muted = !audioRef.current.muted;
    props.toggleMute();
  };

  /**
   * Event handler for end of track. Will either play next song or will
   *  repeat song depending on repeat state.
   */
  const onEnd = () => {
    if (repeat) {
      audioRef.current.load();
      audioRef.current.play();
    } else {
      nextTrack();
    }
  };

  /**
   * Event handler for audio element to handle track duration changes.
   *  (Normally when a new track is loaded)
   */
  const onDurationChange = () => {
    props.setDuration(audioRef.current.duration);
  };

  /**
   * Event handler for audio element to handle time updates from track playing
   *  by updating the redux state.
   */
  const onTimeUpdate = () => {
    if (!seeking) props.setCurrentTime(audioRef.current.currentTime);
  };

  /**
   * Event handler for updating the current volume based on a ranged input.
   * @param {Object} evt Event object
   */
  const onVolumeChange = (evt) => {
    audioRef.current.volume = evt.target.value / 100;
    props.setVolume(evt.target.value);
  };

  /**
   * Event handler for user starting seeking to prevent track for moving during
   *  seeking by pausing if playing.
   */
  const onSeekingDown = () => {
    props.toggleSeeking();
    if (audioRef.current && !audioRef.current.paused) togglePlay();
  };

  /**
   * Event handler for audio element to update the current time after seeking
   *  is completed (user releases mouse).
   * @param {Object} evt Event object
   */
  const onSeekingUp = (evt) => {
    props.toggleSeeking();
    audioRef.current.currentTime = (evt.target.value / 100) * duration;
    if (audioRef.current && audioRef.current.paused) togglePlay();
  };

  /**
   * Event handler for updating current time based on range input.
   * @param {Object} evt Event object
   */
  const onSeeking = (evt) => {
    props.setCurrentTime((evt.target.value / 100) * duration);
  };

  return (
    <>
      <audio
        id="track"
        className="audio"
        controls
        autoPlay
        ref={audioRef}
        onEnded={onEnd}
        onDurationChange={onDurationChange}
        onTimeUpdate={onTimeUpdate}
      >
        <track kind="captions" />
        <source src={fileUrl} type="audio/mpeg" />
      </audio>

      <div
        className={`player ${footer ? 'player--footer' : 'player--full'}`}
        data-cy="media-player"
      >
        <div className="player__info">
          <img className="player__image" alt="Track cover art" src={coverArt} />

          <p className="player__track">
            <span className="player__title" data-cy="title" title={title}>
              {title}
            </span>

            <Link
              to={`/user/${artistId}`}
              className="player__author"
              title={artist}
            >
              {artist}
            </Link>
          </p>
        </div>

        <div className="player__options">
          <div className="player__stack">
            <div className="player__controls">
              <div className="player__control-group">
                <button
                  className="btn btn--inline btn--media"
                  type="button"
                  onClick={prevTrack}
                >
                  <i className="player__control player__control--medium fa fa-backward" />
                </button>

                <button
                  className="btn btn--inline btn--media"
                  type="button"
                  onClick={togglePlay}
                  data-cy="play"
                >
                  <i
                    className={`player__control player__control--large  fa ${
                      audioRef.current && !audioRef.current.paused
                        ? 'fa-pause'
                        : 'fa-play'
                    }`}
                  />
                </button>

                <button
                  className="btn btn--inline btn--media"
                  type="button"
                  onClick={nextTrack}
                  data-cy="forward"
                >
                  <i className="player__control player__control--medium  fa fa-forward" />
                </button>
              </div>

              <div className="player__control-group">
                <button
                  className="btn btn--inline btn--media"
                  type="button"
                  onClick={props.toggleRepeat}
                  data-cy="repeat"
                >
                  <i
                    className={`player__control ${
                      repeat ? 'player__control--highlight' : ''
                    } fa fas fa-redo `}
                  />
                </button>

                {props.user.authenticated ? (
                  <button
                    className="btn btn--inline btn--media"
                    type="button"
                    data-cy="like"
                    onClick={() => props.likeTrack(id, userLikes)}
                  >
                    <i
                      className={`player__control ${
                        userLikes ? 'fas' : 'far'
                      } fa-heart`}
                    />
                  </button>
                ) : null}

                <button
                  className="btn btn--inline btn--media"
                  type="button"
                  onClick={props.toggleShuffle}
                >
                  <i
                    className={`player__control ${
                      shuffle ? 'player__control--highlight' : ''
                    } fa fa-random`}
                  />
                </button>
              </div>
            </div>

            <div className="player__duration">
              <input
                data-cy="timeline"
                className="player__timeline"
                type="range"
                min="0"
                max="100"
                value={duration > 0 ? (currentTime / duration) * 100 : 0}
                onChange={onSeeking}
                onMouseUp={onSeekingUp}
                onMouseDown={onSeekingDown}
              />

              <div className="player__time">
                <span className="player__time-left" data-cy="current-time">
                  {changeToTime(currentTime)}
                </span>
                <span className="player__time-right">
                  {changeToTime(duration)}
                </span>
              </div>
            </div>
          </div>

          <div className="player__volume">
            <button
              className="btn btn--inline btn--media"
              type="button"
              onClick={mute}
            >
              <i
                className={`player__control player__mute fa ${
                  muted ? 'fa-volume-mute' : 'fa-volume-up'
                }`}
              />
            </button>

            <input
              className="player__volume-bar"
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume}
              onChange={onVolumeChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  mediaPlayer: state.mediaPlayer,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  likeTrack: (trackId, remove) => dispatch(likeTrack(trackId, remove)),
  skipTrack: () => dispatch(skipTrack()),
  prevTrack: () => dispatch(prevTrack()),
  restartPlaylist: () => dispatch(restartPlaylist()),
  toggleRepeat: () => dispatch(toggleRepeat()),
  toggleShuffle: () => dispatch(toggleShuffle()),
  toggleMute: () => dispatch(toggleMute()),
  setVolume: (vol) => dispatch(setVolume(vol)),
  setDuration: (duration) => dispatch(setDuration(duration)),
  setCurrentTime: (time) => dispatch(setCurrentTime(time)),
  toggleSeeking: () => dispatch(toggleSeeking()),
});

MediaPlayer.propTypes = {
  likeTrack: PropTypes.func.isRequired,
  skipTrack: PropTypes.func.isRequired,
  prevTrack: PropTypes.func.isRequired,
  restartPlaylist: PropTypes.func.isRequired,
  toggleRepeat: PropTypes.func.isRequired,
  toggleShuffle: PropTypes.func.isRequired,
  toggleMute: PropTypes.func.isRequired,
  setVolume: PropTypes.func.isRequired,
  setDuration: PropTypes.func.isRequired,
  setCurrentTime: PropTypes.func.isRequired,
  toggleSeeking: PropTypes.func.isRequired,
  user: PropTypes.shape({
    authenticated: PropTypes.bool,
  }).isRequired,
  mediaPlayer: PropTypes.shape({
    requesting: PropTypes.bool,
    playlist: PropTypes.array,
    currentTime: PropTypes.number,
    currentTrack: PropTypes.number,
    volume: PropTypes.number,
    duration: PropTypes.number,
    src: PropTypes.string,
    repeat: PropTypes.bool,
    shuffle: PropTypes.bool,
    footer: PropTypes.bool,
    muted: PropTypes.bool,
    seeking: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(MediaPlayer);
