require('dotenv').config();
const nunjucks = require('nunjucks');
const express = require('express');
const fs = require('fs');
const util = require('./public/js/util');

const app = express();
app.use(express.json());
app.use(express.static('public'));
const port = 3000;
nunjucks.configure('templates', {
  autoescape: false,
  express: app,
  trimBlocks: true,
});
app.get('/', (req, res) => {
  return res.render('index.html');
});
// Travelling salesmanS
app.post('/routing/simple', (req, res) => {
  const vals = {
    matrix: req.body.distance_matrix,
    vehicles: 1,
    start: req.body.start,
  };
  const renderedTemplate = nunjucks.render('tsp.cc.njk', vals);
  const base = util.create_source('routing-simple', renderedTemplate);
  /* util.compile_and_run(base, function(results) {
    res.status(201).json(results);
  });*/
});

app.post('/routing/data', (req, res) => {
  console.log(req.body.data);
  return res.status(200);
});

// Routing with multiple vehicles and demands
app.post('/routing/capacity', (req, res) => {
  const vals = {
    matrix: req.body.distance_matrix,
    vehicles: req.body.vehicles,
    start: req.body.start,
    demands: req.body.demands,
    vehicle_capacities: req.body.vehicle_capacities,
  };

 
  const renderedTemplate = nunjucks.render('cap.cc.njk', vals);
  const base = util.create_source('routing-capacity', renderedTemplate);

  res.status(201).json(res.body.distance_matrix);
  /* util.compile_and_run(base, function(results) {
    res.status(201).json(results);
  });*/
});


// Routing with multiple vehicles
app.post('/routing/multi', (req, res) => {
  const vals = {
    matrix: req.body.distance_matrix,
    vehicles: req.body.vehicles,
    start: req.body.start,
  };
  const renderedTemplate = nunjucks.render('vrp.cc.njk', vals);
  const base = util.create_source('routing-multi', renderedTemplate);
  /* util.compile_and_run(base, function(results) {
    res.status(201).json(results);
  });*/
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
