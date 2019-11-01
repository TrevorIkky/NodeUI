const mongoose = require('mongoose');
const progress = new mongoose.Schema({
  userId: {
    type: String,
  },
  progressPath: {
    type: String,
  }
});

module.exports = mongoose.model('completions', progress);
