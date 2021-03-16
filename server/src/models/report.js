const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  profile: { type: Boolean, default: false },
  track: { type: Boolean, default: false },
  message: { type: String, maxlength: 500 },
  created: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
