import * as React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Track from '../shared/Track';
import Loading from '../shared/Loading';
import { getChartList } from '../../actions/chart';
import { setPlaylist } from '../../actions/mediaPlayer';
import './styles/chartPage.css';

const ChartPage = (props) => {
  const { genre } = useParams();

  React.useEffect(() => {
    props.getChartList(genre || 'all');
  }, [genre]);

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

        {props.chart.visibileList.length > 0 ? (
          <ul className="track-list">
            {props.chart.visibileList.map((track, index) => (
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
                    props.mediaPlayer.src === '/chart' &&
                    props.mediaPlayer.playlist[props.mediaPlayer.currentTrack]
                      .id === track.id
                  }
                  onClick={() => {
                    props.setPlaylist(
                      props.chart.visibileList,
                      '/chart',
                      index
                    );
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  chart: state.chart,
  mediaPlayer: state.mediaPlayer,
});

const mapDispatchToProps = (dispatch) => ({
  getChartList: (genre) => dispatch(getChartList(genre)),
  setPlaylist: (tracks, src, currentTrack) =>
    dispatch(setPlaylist(tracks, src, currentTrack)),
});

ChartPage.propTypes = {
  setPlaylist: PropTypes.func.isRequired,
  mediaPlayer: PropTypes.shape({
    currentTrack: PropTypes.number,
    src: PropTypes.string,
    playlist: PropTypes.array,
  }).isRequired,
  chart: PropTypes.shape({
    requesting: PropTypes.bool,
    visibileList: PropTypes.array,
  }).isRequired,
  getChartList: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartPage);
