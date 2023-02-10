import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Track from '../shared/Track';
import { getDashboard } from '../../actions/dashboard';
import { setPlaylist } from '../../actions/mediaPlayer';
import './styles/userHomePage.css';

function capitalizeFirst(str) {
  return `${str.substring(0, 1).toUpperCase()}${str.substring(1)}`;
}

const UserHomePage = (props) => {
  React.useEffect(() => {
    props.getDashboard();
  }, []);

  return (
    <section className="dashboard">
      <header className="">
        <div className="dashboard__collections">
          {props.dashboard.collections.map((collection) => (
            <div
              key={`colleciton-${collection.id}`}
              className="dashboard__collection"
            >
              <button
                type="button"
                className="transition-colors btn dashboard__play"
                onClick={() => {
                  props.setPlaylist(
                    props.dashboard.topTracks,
                    `/collection/${collection.id}`,
                    0
                  );
                }}
              >
                {props.mediaPlayer.src === `/collection/${collection.id}` ? (
                  <i className="fa fa-pause" />
                ) : (
                  <i className="fa fa-play" />
                )}
              </button>

              <div className="dashboard__collection-info">
                <h3 className="dashboard__collection-title">
                  {collection.title}
                </h3>
                <p className="dashboard__collection-owner">
                  {collection.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="dashboard__content">
        <div className="dashboard__genres">
          <h3 className="dashboard__subheading">Genres</h3>

          <ul className="dashboard__genres-list">
            {props.dashboard.genres
              ? props.dashboard.genres.map((genre) => (
                  <li
                    key={`dashboard-genre-${genre}`}
                    className="dashboard__genres-item "
                  >
                    <Link
                      className="transition-colors shadow--center dashboard__genres-link"
                      to={`/chart/${genre}`}
                    >
                      {capitalizeFirst(genre)}
                    </Link>
                  </li>
                ))
              : null}
          </ul>

          <Link
            className="transition-colors shadow--center dashboard__genres-all"
            to="/chart"
          >
            All Genres
          </Link>
        </div>

        <div className="dashboard__top">
          <h3 className="dashboard__subheading">Top Tracks</h3>
          <ul className="shadow--center dashboard__top-list ">
            {props.dashboard.topTracks
              ? props.dashboard.topTracks.map((track, index) => (
                  <li className="dashboard__top-item" key={track.id}>
                    <Track
                      id={track.id}
                      title={track.title}
                      artist={track.artist}
                      artistId={track.artistId}
                      coverArt={track.coverArt}
                      explicit={track.explicit}
                      playing={
                        props.mediaPlayer.playlist.length > 0 &&
                        props.mediaPlayer.src === '/top' &&
                        props.mediaPlayer.playlist[
                          props.mediaPlayer.currentTrack
                        ].id === track.id
                      }
                      onClick={() => {
                        props.setPlaylist(
                          props.dashboard.topTracks,
                          `/top`,
                          index
                        );
                      }}
                    />
                  </li>
                ))
              : null}
          </ul>
        </div>

        <div className="dashboard__trending">
          <h3 className="dashboard__subheading">Trending Artist</h3>

          <ul className="dashboard__trending-list">
            {props.dashboard.trendingArtists
              ? props.dashboard.trendingArtists.map((artist) => (
                  <li
                    title={artist.displayName}
                    key={`trending-artist-${artist.id}`}
                    className="shadow--center dashboard__trending-item"
                  >
                    <Link
                      className="dashboard__trending-link"
                      to={`/user/${artist.id}`}
                    >
                      <img
                        className="dashboard__trending-img"
                        src={artist.profilePicture}
                        alt="Artist profile"
                      />
                    </Link>

                    <div className="dashboard__trending-username">
                      <Link
                        className="dashboard__trending-link"
                        to={`/user/${artist.id}`}
                      >
                        {artist.displayName}
                      </Link>
                    </div>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  dashboard: state.dashboard,
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  getDashboard: () => dispatch(getDashboard()),
  setPlaylist: (track, src, current) =>
    dispatch(setPlaylist(track, src, current)),
});

UserHomePage.propTypes = {
  getDashboard: PropTypes.func.isRequired,
  setPlaylist: PropTypes.func.isRequired,
  mediaPlayer: PropTypes.shape({
    currentTrack: PropTypes.number,
    src: PropTypes.string,
    playlist: PropTypes.array,
  }).isRequired,
  dashboard: PropTypes.shape({
    genres: PropTypes.array,
    collections: PropTypes.array,
    topTracks: PropTypes.array,
    trendingArtists: PropTypes.array,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserHomePage);
