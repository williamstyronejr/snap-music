const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: { type: String, default: '' },
  type: { type: String, required: true },
  belongTo: { type: String, required: true },
});

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
