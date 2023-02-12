import * as React from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import Track from '../shared/Track';
import { getRandomTracks, setPlaylist } from '../../actions/mediaPlayer';
import './styles/discoveryPage.css';

const DiscoveryMediaPage = (props) => {
  const { genre } = useParams();
  React.useEffect(() => {
    // Only get more tracks if the src of the playlist is being changed
    if (
      !props.mediaPlayer.requesting &&
      props.mediaPlayer.src !== `/discovery/${genre}`
    ) {
      props.getRandomTracks(genre);
    }
  }, [props.mediaPlayer.requesting, props.mediaPlayer.src, genre]);

  if (
    !props.mediaPlayer.requesting &&
    props.mediaPlayer.playlist.length === 0
  ) {
    return (
      <section className="discovery discovery--missing">
        <p>Sorry, there are no track avaiable for this genre.</p>
        <Link to="/discovery" className="link">
          Click here to go back
        </Link>
      </section>
    );
  }

  return (
    <section className="discovery">
      <div className="discovery__wrapper">
        <ul className="discovery-list">
          {props.mediaPlayer.playlist.map((track, index) => (
            <li className="discovery-list__item" key={`chart-item-${track.id}`}>
              <Track
                id={track._id}
                title={track.title}
                artist={track.artist}
                artistId={track.artistId}
                coverArt={track.coverArt}
                explicit={track.explicit}
                playing={
                  props.mediaPlayer.playlist.length > 0 &&
                  props.mediaPlayer.src === `/discovery/${genre}` &&
                  props.mediaPlayer.playlist[props.mediaPlayer.currentTrack]
                    ._id === track._id
                }
                onClick={() => {
                  props.setPlaylist(
                    props.mediaPlayer.playlist,
                    `/discovery/${genre}`,
                    index
                  );
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  setPlaylist: (tracks, src, currentTrack) =>
    dispatch(setPlaylist(tracks, src, currentTrack)),
  getRandomTracks: (genre, empty) => dispatch(getRandomTracks(genre, empty)),
});

DiscoveryMediaPage.propTypes = {
  getRandomTracks: PropTypes.func.isRequired,
  setPlaylist: PropTypes.func.isRequired,
  mediaPlayer: PropTypes.shape({
    requesting: PropTypes.bool,
    playlist: PropTypes.array,
    src: PropTypes.string,
    currentTrack: PropTypes.number,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(DiscoveryMediaPage);
