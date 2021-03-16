exports.sendTemplateEmail = jest.fn((templateName, to, subject, params, cb) => {
  cb(null);
});
