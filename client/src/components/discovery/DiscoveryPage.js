import * as React from 'react';
import { Link } from 'react-router-dom';
import { genreList } from '../../utils/utils';
import './styles/discoveryPage.css';

const DiscoveryPage = (props) => {
  const genreListItems = genreList.map((genre) => (
    <div className="grid__item" key={`genre-${genre}`}>
      <Link to={`/discovery/${genre}`} className="content-center genre">
        {genre}
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
