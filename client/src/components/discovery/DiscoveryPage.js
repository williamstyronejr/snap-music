import * as React from 'react';
import { Link } from 'react-router-dom';
import { genreList } from '../../utils/utils';
import './styles/discoveryPage.css';

const DiscoveryPage = () => {
  const genreListItems = genreList.map((genre) => (
    <div className="grid__item" key={`genre-${genre}`}>
      <Link to={`/discovery/${genre}`} className="grid__link content-center">
        <span className="genre">{genre}</span>
      </Link>
    </div>
  ));

  return (
    <section className="discovery">
      <h1 className="discovery__header">Pick a genre to start listening</h1>
      <div className="discovery__grid">{genreListItems}</div>
    </section>
  );
};

export default DiscoveryPage;
