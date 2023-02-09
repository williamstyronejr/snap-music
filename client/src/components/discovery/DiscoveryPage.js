import * as React from 'react';
import { Link } from 'react-router-dom';
import useGenresData from '../shared/useGenresData';
import Loading from '../shared/Loading';
import './styles/discoveryPage.css';

const DiscoveryPage = () => {
  const { loading, genres } = useGenresData();

  return (
    <section className="discovery">
      <h1 className="discovery__header">Discovery by Genre</h1>
      <div className="discovery__grid">
        {loading ? <Loading /> : null}

        {genres.map((genre) => (
          <div className="grid__item" key={`genre-${genre.id}`}>
            <Link to={`/discovery/${genre.name}`} className="grid__link">
              <span className="genre">{genre.name}</span>
              {genre.image ? (
                <img
                  className="discovery__genre-img"
                  src={`/img/${genre.image}`}
                  alt=""
                />
              ) : null}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscoveryPage;
