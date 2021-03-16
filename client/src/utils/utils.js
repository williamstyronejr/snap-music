import axios from 'axios';

/**
 * Sends a ajax request using axios and returns a promise for the request.
 * @param {String} url URL to send request to
 * @param {String} method Method to use for request
 * @param {Any} options Additional options
 * @return {Promise<OBject>} A promise to resolve or reject with the server response.
 */
export function ajaxRequest(url, method = 'get', options = null) {
  return axios({
    url,
    method,
    ...options,
  });
}

/**
 * Checks that a file meants size and type requirements. Should be smaller
 *  than 5mb and an audio type.
 * @param {Object} file File object to test
 * @return {Boolean} Returns true if the file is valid, false otherwise.
 */
export function isFileValid(file, type) {
  if (type === 'audio' && !file.type.startsWith('audio')) return false;
  if (type === 'image' && !file.type.startsWith('image')) return false;
  if (file.type.size > 10000000) return false;

  return true;
}
