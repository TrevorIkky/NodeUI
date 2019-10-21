const mongoose = require('mongoose')

const simpleSchema = new mongoose.Schema({
  problemId: String,
  solver_time: Number,
  vehicles: [{ distance: Number, path: [Number] }],
});
  
const capacitySchema = new mongoose.Schema({
  problemId: String,
  solver_time: Number,
  total_distance: Number,
  vehicles: [{
    distance: Number,
    load: [Number],
    path: [Number],
  }],
});

const multiSchema = new mongoose.Schema({
  problemId: String,
  solver_time: Number,
  total_distance: Number,
  vehicles: [{
    distance: Number,
    load: [Number],
    path: [Number],
  }],
});

module.exports = {
  simpleRouting: mongoose.model('SimpleRouting', simpleSchema),
  capacityRouting: mongoose.model('CapacityRouting', capacitySchema),
  multiRouting: mongoose.model('MultiRouting', multiSchema),
}
