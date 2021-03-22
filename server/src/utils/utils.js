const fs = require('fs');
const path = require('path');

const { GCLOUD_APPLICATION_CONTENT } = process.env;

/**
 * Creates a config file for GCloud using env varible for content.
 * @param {String} filePath Path of file to create
 * @return {Promise<void>} Returns a promise to resolve when file is created.
 */
function createGCloudConfig(filePath) {
  if (!GCLOUD_APPLICATION_CONTENT)
    throw new Error('Required gcloud does not exists and can not be created.');
  fs.promises.writeFile(filePath, GCLOUD_APPLICATION_CONTENT);
}

/**
 * Checks if the credential file for gcloud (firebase) to works exists. If file
 *  doesn't exist, then attempt to create it with the content in env variable.
 * @param {String} filePath Path to credential file
 * @return {Boolean} Returns a promise to resolve with a flag indicating if the
 *  file exists.
 */
exports.verifyGcloudConfig = (filePath) => {
  return fs.promises
    .access(filePath)
    .then((res) => {
      return true;
    })
    .catch((err) => {
      return createGCloudConfig(filePath);
    });
};
