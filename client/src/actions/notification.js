export const SETNOTIFICATION = 'setNotification';
export const CLOSENOTIFICATION = 'closeNotification';
export const SETNOTIFICATIONERROR = 'setNotificationError';

/**
 * Redux action creator for setting an error notification.
 * @param {String} msg Error message to be set
 * @return {Object} Returns a redux action object.
 */
export function setNotificationError(msg) {
  return {
    type: SETNOTIFICATIONERROR,
    payload: msg,
  };
}

/**
 * Redux action creator for setting a non-error notification.
 * @param {String} msg Text to display in notification.
 * @return {Object} Returns a redux action object.
 */
export function setNotification(msg) {
  return {
    type: SETNOTIFICATION,
    payload: msg,
  };
}

/**
 * Redux action creator for clearing notifications.
 * @return {Object} Returns a redux action object.
 */
export function closeNotification() {
  return {
    type: CLOSENOTIFICATION,
    payload: false,
  };
}
