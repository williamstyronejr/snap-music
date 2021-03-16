import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getRandomTracks, toggleDisplay } from '../../actions/mediaPlayer';
import './styles/discoveryPage.css';

const DiscoveryMediaPage = (props) => {
  // Only get more tracks if the src of the playlist is being changed
  if (
    !props.mediaPlayer.requesting &&
    props.mediaPlayer.src !== `/discovery/${props.match.params.genre}`
  ) {
    props.getRandomTracks(props.match.params.genre);
  }

  React.useEffect(() => {
    // Toggles media player to be full screen or footer
    props.toggleDisplay();

    return () => {
      props.toggleDisplay();
    };
  }, [props.toggleDisplay]);

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

export default connect(mapStateToProps, mapDispatchToProps)(DiscoveryMediaPage);
