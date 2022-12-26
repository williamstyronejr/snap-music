import * as React from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getRandomTracks, toggleDisplay } from '../../actions/mediaPlayer';
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

  React.useEffect(() => {
    // Toggles media player to be full screen or footer
    props.toggleDisplay();

    return () => {
      props.toggleDisplay();
    };
  }, []);

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

  return null;
};

const mapStateToProps = (state) => ({
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  getRandomTracks: (genre, empty) => dispatch(getRandomTracks(genre, empty)),
  toggleDisplay: () => dispatch(toggleDisplay()),
});

DiscoveryMediaPage.propTypes = {
  getRandomTracks: PropTypes.func.isRequired,
  toggleDisplay: PropTypes.func.isRequired,
  mediaPlayer: PropTypes.shape({
    requesting: PropTypes.bool,
    playlist: PropTypes.array,
    src: PropTypes.string,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(DiscoveryMediaPage);
