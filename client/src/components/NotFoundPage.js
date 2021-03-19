import * as React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <main className="page-main">
      <section className="content-center">
        <img className="" alt="404" />

        <div className="">
          <h3>
            <span>404</span>Page not found
          </h3>

          <p className="">
            Sorry, it&apo;s seems this page does not exist.
            <Link to="chart">Return Home</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
