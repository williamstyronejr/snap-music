const mongoose = require('mongoose');

const FollowSchema = mongoose.Schema({
  followee: { type: String, index: true },
  follower: { type: String, index: true },
  created: { type: Date, default: Date.now },
});

const Follow = mongoose.model('Follow', FollowSchema);
module.exports = Follow;
