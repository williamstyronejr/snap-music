exports.uploadFileFirebase = jest.fn(
  (file, fileName = null, folderPath = '') => {
    return new Promise((res, rej) => {
      res({
        fieldName: file.fieldname,
        fileName: fileName || file.originalname,
        fileLocation: 'http://localhost:3001',
      });
    });
  }
);

exports.deleteFileFirebase = jest.fn((fileURL, folderPath = null) => {
  return new Promise((res, rej) => {
    res({});
  });
});
