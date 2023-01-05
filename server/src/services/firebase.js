const admin = require('firebase-admin');
const crypto = require('crypto');

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
} = process.env;

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // ENV adds \ to \n, need to replace otherwise error in format
      privateKey: `${FIREBASE_PRIVATE_KEY?.replaceAll('\\n', '\n')}`,
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const storage = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);

/**
 * Deletes a file at url location.
 * @param {String} url Url of file to be deleted
 * @returns {Promise<any>} Returns a promise to reslove with repsonse data from
 *  firebase.
 */
exports.deleteFirebaseFile = async (url) => {
  const internalUrl = url.split('/o/').slice(1).join('/o/').split('?')[0];
  return await storage.file(internalUrl).delete();
};

exports.uploadFirebaseFile = (file) => {
  return new Promise((res, rej) => {
    if (!file) rej(new Error('Filename not provided.'));

    const newFileName = `${crypto.pseudoRandomBytes(8).toString('hex')}.${
      fileName.split('.').slice(-1)[0]
    }`;

    const blob = storage.file(newFileName);
    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobWriter.on('error', (err) => rej(err));

    blobWriter.on('finish', () => {
      // Assembling public URL for accessing the file via HTTP
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        storage.name
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
