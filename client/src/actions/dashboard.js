import { ajaxRequest } from '../utils/utils';

export const UPDATEDASHBOARD = 'updateDashboard';

function setDashboardData(data) {
  return {
    type: UPDATEDASHBOARD,
    payload: data,
  };
}

/**
 * Sends a request to get dashboard data.
 * @returns {Function} Returns a function to dispatch a redux action.
 */
export function getDashboard() {
  return (dispatch) => {
    ajaxRequest('/api/dashboard', 'GET')
      .then((res) => {
        dispatch(setDashboardData(res.data));
      })
      .catch(() => {});
  };
}
