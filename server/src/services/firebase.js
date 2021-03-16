const { Storage } = require('@google-cloud/storage');

const {
  GCLOUD_PROJECT_ID,
  GCLOUD_STORAGE_BUCKET_URL,
  GCLOUD_APPLICATION_CREDENTIALS,
} = process.env;

const storage = new Storage({
  projectId: GCLOUD_PROJECT_ID,
  keyFilename: GCLOUD_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(GCLOUD_STORAGE_BUCKET_URL);

/**
 * Uploads a file to firebase storage.
 * @param {Object} file File object to upload
 * @param {String} fileName Name to store file under (uses originalname if null)
 * @param {String} folderPath Path to store file in
 * @return {Promise<Object>} Returns a promise to resolve when the file has
 *  been uploaded.
 */
exports.uploadFileFirebase = (file, fileName = null, folderPath = '') => {
  return new Promise((res, rej) => {
    if (!file) {
      const err = new Error('No file provided.');
      throw err;
    }

    const blob = bucket.file(
      `${folderPath}${fileName ? fileName : file.originalname}`
    );

    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobWriter.on('error', (err) => rej(err));

    blobWriter.on('finish', () => {
      // Assembling public URL for accessing the file via HTTP
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

      // Return the file name and its public URL
      res({
        fieldName: file.fieldname,
        fileName: file.originalname,
        fileLocation: publicUrl,
      });
    });

    blobWriter.end(file.buffer);
  });
};

/**
 * Deletes a fire from firebase storage and returned the promise to resolve
 *  when deletion is completed.
 * @param {String} fileURL URL of file on firebase
 * @param {String} folderPath Firebase path
 * @return {Promise<Object>} Return a promise a results to resolve when the file
 *  is deleted.
 */
exports.deleteFileFirebase = (fileURL, folderPath = '') => {
  return new Promise((res, rej) => {
    const urlSplit = fileURL.split('/');
    const fileName = urlSplit[urlSplit.length - 1].split('?')[0];

    bucket.file(`${folderPath}${fileName}`).delete((err, apiRes) => {
      if (err) rej(err);
      res(apiRes);
    });
  });
};
