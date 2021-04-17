import * as React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './styles/track.css';

const Track = (props) => {
  if (!props.id) return <div>No Track</div>;

  return (
    <button
      className={`btn track ${props.playing ? 'track--playing' : ''}`}
      onClick={props.onClick}
      type="button"
      data-cy="track"
    >
      <div className="track__controls">
        <button className="btn" type="button">
          <i className="fa fa-play" />
        </button>
      </div>

      <div className="track__image">
        <img
          className="track__cover"
          src={props.coverArt}
          alt="Track cover art"
        />
      </div>

      <div className="track-info">
        <p className="track-info__title">{props.title}</p>
        <Link
          onClick={(evt) => evt.stopPropagation()}
          className="track-info__author"
          to={`/user/${props.artistId}`}
        >
          {props.artist}
        </Link>
      </div>

      {props.explicit ? <div className="track__explicit">E</div> : null}
    </button>
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
