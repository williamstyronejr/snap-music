import * as React from 'react';
import { Link } from 'react-router-dom';
import { genreList } from '../../utils/utils';
import './styles/discoveryPage.css';

const DiscoveryPage = () => {
  return (
    <section className="discovery">
      <h1 className="discovery__header">Discovery by Genre</h1>
      <div className="discovery__grid">
        {genreList.map((genre) => (
          <div className="grid__item" key={`genre-${genre}`}>
            <Link to={`/discovery/${genre}`} className="grid__link">
              <span className="genre">{genre}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscoveryPage;
