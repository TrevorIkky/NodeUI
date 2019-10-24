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
  created: Date,

});

module.exports = mongoose.model('users', usersSchema);
