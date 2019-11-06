const mongoose = require('mongoose');
const progress = new mongoose.Schema({
  userId: {
    type: String,
  },
  name : String,
  progressPath: {
    type: String,
  },
  createdAt : Date,
});

module.exports = mongoose.model('completions', progress);
