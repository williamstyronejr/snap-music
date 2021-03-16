const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const handlerbars = require('handlebars');

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Creates an email from a template using handlersbars to fill in parameters.
 *  Assumes that all templates are in /template/emails, otherwise the file will
 *  not be found.
 * @param {String} templateName Name of file to get from email templates folder.
 * @param {Object} params Parameters to use for template.
 * @param {Function} cb Callback to receive email or error if one occurs.
 */
function createEmailFromTemplate(templateName, params, cb) {
  const loc = path.join(__dirname, '../templates/emails', templateName);

  fs.readFile(loc, { encoding: 'utf-8' }, (err, content) => {
    if (err) return cb(err);

    const htmlCompile = handlerbars.compile(content);
    const html = htmlCompile(params);

    cb(null, html);
  });
}

/**
 * Sends a email generated from a template and sends it using nodemailer.
 * @param {String} templateName Name of template file to use.
 * @param {String} to Recipient of the email being sent.
 * @param {String} subject The subject of the email being sent.
 * @param {Object} params Object of values to use in template.
 * @param {Function} cb Callback to receive mail data once email is sent,
 * or an error if one occurs.
 */
exports.sendTemplateEmail = (templateName, to, subject, params, cb) => {
  createEmailFromTemplate(templateName, params, (err, html) => {
    if (err) return cb(err);

    transporter.sendMail(
      {
        to,
        subject,
        html,
      },
      cb
    );
  });
};
