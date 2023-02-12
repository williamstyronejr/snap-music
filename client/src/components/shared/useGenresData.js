import * as React from 'react';
import { ajaxRequest } from '../../utils/utils';

// Simple Cache, should upgrade
let cacheGenres = [];

const useGenresData = () => {
  const [loading, setLoading] = React.useState(false);
  const [genres, setGenres] = React.useState(cacheGenres);

  React.useEffect(() => {
    if (genres.length !== 0) return;
    setLoading(true);

    ajaxRequest('/api/genres').then((res) => {
      setGenres(res.data.genres);
      setLoading(false);
      cacheGenres = res.data.genres;
    });
  }, [genres]);

  return { loading, genres };
};

export default useGenresData;
