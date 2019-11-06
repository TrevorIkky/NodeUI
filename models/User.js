const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profileUrl: {
    type: String,
    default: '...',
  },
  about: {
    type: String,
    default: 'About me goes here',
  },
  created: Date,

});

module.exports = mongoose.model('users', usersSchema);
