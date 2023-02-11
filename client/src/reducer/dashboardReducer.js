import { UPDATEDASHBOARD } from '../actions/dashboard';

const initState = {
  genres: [],
  collections: [],
  topTracks: [],
  trendingArtists: [],
};

const dashboardReducer = (state = initState, action) => {
  switch (action.type) {
    case UPDATEDASHBOARD:
      return {
        ...initState,
        genres: action.payload.genres,
        collections: action.payload.collections,
        topTracks: action.payload.topTracks,
        trendingArtists: action.payload.trendingArtists,
      };
    default:
      return state;
  }
};

export default dashboardReducer;
