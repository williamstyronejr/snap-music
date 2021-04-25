import { ajaxRequest } from '../utils/utils';
import { setNotificationError } from './notification';

export const TOGGLENIGHTMODE = 'toggle_night_mode';
export const SETAUTHERROR = 'setAuthError';
export const SETAUTHDATA = 'setAuthData';
export const UNAUTHUSER = 'unauthUser';
export const AUTHENTICATING = 'authenticating';
export const UPDATEUSERDATA = 'updateUserData';

/**
 * Redux action creator for setting authentication data.
 * @param {Object} data User data
 * @return {Object} Returns a redux action object.
 */
function setAuthData(data) {
  return {
    type: SETAUTHDATA,
    payload: data,
  };
}

/**
 * Redux action creator for unauthentizing the user.
 * @return {Object} Returns a redux action object.
 */
export function unauthUser() {
  return {
    type: UNAUTHUSER,
  };
}

/**
 * Redux action creator for setting authenticating flag and resetting
 *  authenticated and authError fields.
 * @param {Boolean} authenticating Flag indicating if authenticating
 * @return {Object} Returns a redux action object.
 */
function setAuthenticating(authenticating = true) {
  return {
    type: AUTHENTICATING,
    payload: authenticating,
  };
}

/**
 * Redux action creator for setting errors that occur during authentication.
 * @param {String} err Error that occurred during authentication
 * @return {Object} Returns a redux action object.
 */
export function setAuthError(err) {
  return {
    type: SETAUTHERROR,
    payload: err,
  };
}

/**
 * Redux action creator for toggling night mode.
 * @return {Object} Returns a redux action object.
 */
export function toggleNightMode() {
  return {
    type: TOGGLENIGHTMODE,
  };
}

/**
 * Redux action creator for updating user data. Used to typically update changes
 *  made through something like a settings page. (Doesn't update auth info)
 * @param {Object} data User data
 * @return {Object} Returns a redux action object.
 */
export function updateUserData(data) {
  return {
    type: UPDATEUSERDATA,
    payload: data,
  };
}

/**
 * Sends an AJAX request to sign a user in. If successful, the user's data is
 *  then stored. Otherwise, an error is stored.
 * @param {String} user Username or email
 * @param {String} password User's password
 * @return {Function} Returns a function to dispatch actions for signing a user
 *  in.
 */
export function signin(user, password) {
  return (dispatch) => {
    dispatch(setAuthenticating());

    ajaxRequest('/signin', 'POST', {
      data: {
        user,
        password,
      },
    })
      .then((res) => {
        if (res.data.success) dispatch(setAuthData(res.data.user));
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          return dispatch(
            setAuthError({
              data: 'Invalid username or password',
            })
          );
        }

        dispatch(setAuthenticating(false));
        dispatch(
          setNotificationError(
            'An error occurred during signin, please try again.'
          )
        );
      });
  };
}

/**
 * Sends a request to create a new user account. If successful, then the user
 *  data is stored. Otherwise, an error is stored if a validation error or a
 *  notification is displayed for server errors.
 * @param {String} username Username for new user
 * @param {String} email Email for new user
 * @param {String} password User's password for new user
 * @param {String} confirm Password confirmation
 * @return {Function} Returns a function to dispatch actions for creating a new
 *  user account.
 */
export function signup(username, email, password, confirm) {
  return (dispatch) => {
    dispatch(setAuthenticating());
    ajaxRequest('/signup', 'POST', {
      data: {
        username,
        email,
        password,
        confirm,
      },
    })
      .then((res) => {
        if (res.data.success) dispatch(setAuthData(res.data.user));
      })
      .catch((err) => {
        if (err.response && err.response.status === 400) {
          return dispatch(
            setAuthError({
              ...err.response.data,
            })
          );
        }

        dispatch(setAuthenticating(false));
        dispatch(
          setNotificationError(
            'An unknown error occurred on the server. Please try again later.'
          )
        );
      });
  };
}

/**
 * Sends a request to get current user's data. If successful, then user data is
 *  stored. Errors (401 or otherwise) are handled by just resetting the flags.
 * @return {Function} Returns a function to dispatch action.
 */
export function getUserData() {
  return (dispatch) => {
    dispatch(setAuthenticating());

    ajaxRequest('/session/user', 'GET')
      .then((res) => {
        if (res.data.success) dispatch(setAuthData(res.data.user));
      })
      .catch(() => {
        dispatch(setAuthenticating(false));
      });
  };
}
