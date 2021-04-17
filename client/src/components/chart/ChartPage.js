import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Track from '../shared/Track';
import Loading from '../shared/Loading';
import { getGenreList } from '../../actions/genre';
import { getChartList } from '../../actions/chart';
import { setPlaylist } from '../../actions/mediaPlayer';
import './styles/chartPage.css';

const ChartPage = (props) => {
  React.useEffect(() => {
    // Get initial chart list
    props.getChartList('all');
  }, []);

  const chartList = props.chart.visibileList.map((track, index) => {
    return (
      <li className="track-list__item" key={`chart-item-${track.id}`}>
        <Track
          id={track.id}
          title={track.title}
          artist={track.artist}
          artistId={track.artistId}
          coverArt={track.coverArt}
          explicit={track.explicit}
          playing={
            props.mediaPlayer.playlist.length > 0 &&
            props.mediaPlayer.playlist[props.mediaPlayer.currentTrack].id ===
              track.id
          }
          onClick={() => {
            props.setPlaylist(props.chart.visibileList, '/chart', index);
          }}
        />
      </li>
    );
  });

  return (
    <section className="chart">
      <header className="chart__header">
        <h3 className="chart__heading">Top Tracks</h3>
      </header>

      <div className="chart-list">
        {!props.chart.requesting && props.chart.visibileList.length === 0 ? (
          <div className="chart-list__empty">No tracks for this genre</div>
        ) : null}

        {props.chart.requesting ? <Loading /> : null}
        <ul className="track-list">{chartList}</ul>
      </div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  chart: state.chart,
  genres: state.genre.genres,
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  getChartList: (genre) => dispatch(getChartList(genre)),
  getGenreList: () => dispatch(getGenreList()),
  setPlaylist: (tracks, src, currentTrack) =>
    dispatch(setPlaylist(tracks, src, currentTrack)),
});

ChartPage.propsTypes = {
  chart: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartPage);
