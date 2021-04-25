import * as React from 'react';
import { Link } from 'react-router-dom';
import './styles/homePage.css';

const HomePage = () => {
  return (
    <section className="home">
      <header className="home__header" />

      <ul className="home__list">
        <li className="home__item">Create</li>
        <li className="home__item">Share</li>
        <li className="home__item">Discover</li>
        <li className="home__item home__item--small">
          New music all in a day!
        </li>
      </ul>

      <Link to="/signup" className="home__link">
        Create an Account
      </Link>
    </section>
  );
};

export default HomePage;
