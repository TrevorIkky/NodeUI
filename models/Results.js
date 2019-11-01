const mongoose = require('mongoose');

const resultsDB = mongoose.createConnection('mongodb://localhost/results',
  {useNewUrlParser: true, useUnifiedTopology: true});
resultsDB.on('error', (error) => console.error(error));
resultsDB.once('open', () => console.log('Connected to Results database'));

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

module.exports = {
  Routing: resultsDB.model('RoutingSchema', routingSchema),
};
