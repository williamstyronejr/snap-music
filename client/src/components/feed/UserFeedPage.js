import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { clearFeed, getFeedUpdates } from '../../actions/feed';
import { setPlaylist } from '../../actions/mediaPlayer';
import Track from '../shared/Track';
import './styles/userFeedPage.css';

const UserFeedPage = (props) => {
  React.useEffect(() => {
    return () => {
      props.clearFeed();
    };
  }, []);
  React.useEffect(() => {
    if (props.feed.items.length === 0) {
      props.getFeedUpdates();
    }
  }, [props.feed.items, props.feed.lastUpdated]);

  const feedList = props.feed.items.map((item, index) => (
    <li className="feed__item" key={item.id}>
      <Track
        id={item.id}
        title={item.title}
        artist={item.artist}
        artistId={item.artistId}
        coverArt={item.coverArt}
        explicit={item.explicit}
        playing={
          props.mediaPlayer.playlist.length > 0 &&
          props.mediaPlayer.src === '/feed' &&
          props.mediaPlayer.playlist[props.mediaPlayer.currentTrack].id ===
            item.id
        }
        onClick={() => {
          props.setPlaylist(props.feed.items, '/feed', index);
        }}
      />
    </li>
  ));

  return (
    <section className="feed">
      <header className="feed__header">
        <h2 className="feed__heading">Feed</h2>
      </header>

      <ul className="feed__list">{feedList}</ul>
    </section>
  );
};

const mapStateToProps = (state) => ({
  feed: state.feed,
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  getFeedUpdates: () => dispatch(getFeedUpdates()),
  clearFeed: () => dispatch(clearFeed()),
  setPlaylist: (tracks, src, currentTrack) =>
    dispatch(setPlaylist(tracks, src, currentTrack)),
});

UserFeedPage.propTypes = {
  feed: PropTypes.shape({
    items: PropTypes.array,
    lastUpdated: PropTypes.number,
  }).isRequired,
  mediaPlayer: PropTypes.shape({
    playlist: PropTypes.array,
    currentTrack: PropTypes.number,
    src: PropTypes.string,
  }).isRequired,
  setPlaylist: PropTypes.func.isRequired,
  clearFeed: PropTypes.func.isRequired,
  getFeedUpdates: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserFeedPage);
