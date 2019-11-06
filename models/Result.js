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

const schedulingSchema = new mongoose.Schema({
  problemId: String,
  solver_time: Number,
  fulfillment_ratio: Number,
  allocation: [[Number]]
});

module.exports = {
  Routing: mongoose.model('RoutingSchema', routingSchema),
  Scheduling: mongoose.model('SchedulingSchema', schedulingSchema),
};
