import * as React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { getRandomTracks } from '../../actions/mediaPlayer';
import { getGenreList } from '../../actions/genre';
import './styles/discoveryPage.css';

const DiscoveryPage = (props) => {
  // Grabs genre list if not already populated
  React.useEffect(() => {
    if (props.genres.length === 0) {
      props.getGenreList();
    }
  }, [props.getGenreList, props.genres]);

  const genreList = props.genres.map((genre) => (
    <div className="grid__item" key={`genre-${genre.name}`}>
      <Link to={`/discovery/${genre.name}`} className="content-center genre">
        {genre.name}
      </Link>
    </div>
  ));

  return (
    <section className="discovery">
      <h1 className="discovery__header">Pick a genre to start listening</h1>
      <div className="discovery__grid">{genreList}</div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  mediaPlayer: state.mediaPlayer,
  genres: state.genre.genres,
});

const mapDispatchToProps = (dispatch) => ({
  getRandomTracks: (genre, empty) => dispatch(getRandomTracks(genre, empty)),
  getGenreList: () => dispatch(getGenreList()),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DiscoveryPage)
);
