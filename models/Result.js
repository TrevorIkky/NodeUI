const mongoose = require('mongoose');

const routingSchema = new mongoose.Schema({
  problemId: String,
  solver_time: Number,
  total_distance: Number,
  vehicles: [{
    distance: Number,
    load: [Number],
    path: [Number],
  }],
  locations: [[Number]],
});

module.exports = mongoose.model('routings', routingSchema);
