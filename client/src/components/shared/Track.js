import * as React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './styles/track.css';

const Track = ({
  id,
  title,
  artist,
  artistId,
  onClick,
  coverArt,
  playing,
  explicit,
}) => {
  if (!id) return <div>No Track</div>;

  return (
    <div
      className={`track ${playing ? 'track--playing' : ''}`}
      onClick={onClick}
      onKeyDown={() => {
        onClick();
      }}
      type="button"
      data-cy="track"
      tabIndex={0}
      role="button"
    >
      <div className="track__image">
        <img className="track__cover" src={coverArt} alt="Track cover art" />
      </div>

      <div className="track-info">
        <p className="track-info__title">{title}</p>
        <Link
          onClick={(evt) => evt.stopPropagation()}
          className="track-info__author"
          to={`/user/${artistId}`}
        >
          {artist}
        </Link>
      </div>

      <div className="track__controls">
        <button className="btn track__play" type="button">
          <i className={playing ? 'fa fa-pause' : 'fa fa-play'} />
        </button>
      </div>

      {true ? <div className="track__explicit">E</div> : null}
    </div>
  );
};

Track.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  artistId: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  coverArt: PropTypes.string.isRequired,
  playing: PropTypes.bool.isRequired,
  explicit: PropTypes.bool.isRequired,
};

export default Track;
