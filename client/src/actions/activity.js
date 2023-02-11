import { ajaxRequest } from '../utils/utils';

export const SETACIVITYDATA = 'setActivityData';

function setActivityData(data) {
  return {
    type: SETACIVITYDATA,
    payload: data,
  };
}

export function updateActitityData() {
  return (dispatch) => {
    ajaxRequest('/api/activity', 'GET')
      .then((res) => {
        dispatch(setActivityData(res.data.results));
      })
      .catch(() => {});
  };
}
