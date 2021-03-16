import * as React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './styles/track.css';

const Track = (props) => {
  if (!props.id) return <div>No Track</div>;

  return (
    <div
      className={`track ${props.playing ? 'track--playing' : ''}`}
      onClick={props.onClick}
      data-cy="track"
    >
      <div className="track__controls">
        <button className="btn">
          <i className="fa fa-play" />
        </button>
      </div>

      <div className="track__image">
        <img className="track__cover" src={props.coverArt} />
      </div>
      <div className="track-info">
        <p className="track-info__title">{props.title}</p>
        <Link
          onClick={(evt) => evt.stopPropagation()}
          className="track-info__author"
          to={`/user/${props.artist}`}
        >
          {props.artist}
        </Link>
      </div>

      {props.explicit ? <div className="track__explicit">E</div> : null}
    </div>
  );
};

Track.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  artist: PropTypes.string,
  onClick: PropTypes.func,
  tags: PropTypes.string,
  genre: PropTypes.string,
  coverArt: PropTypes.string,
  playing: PropTypes.bool,
  explicit: PropTypes.bool,
};

export default Track;
