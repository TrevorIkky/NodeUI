require('dotenv').config();
const nunjucks = require('nunjucks');
const express = require('express');
const fs = require('fs');
const util = require('./public/js/util');
const bcrypt = require('bcrypt');
const mongoClient = require('mongoose');

const Users = require('./models/User');

const app = express();
app.use(express.json());
app.use(express.static('public'));
const port = 3000;
nunjucks.configure('templates', {
  autoescape: false,
  express: app,
  trimBlocks: true,
});

mongoClient.Promise = global.Promise;

mongoClient.connect('mongodb://localhost:27017/nodecanvas', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
      console.log('Connected');
    }).catch((error)=>{
      console.log('There was an error');
    });


app.get('/', (req, res) => {
  return res.render('index.html');
});

app.get('/discover', (req, res) => {
  return res.render('discover.html');
});


app.post('/register/add', async (req, res)=>{
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    // eslint-disable-next-line max-len
    const userDetails = {username: req.body.username, email: req.body.email, password: hashedPass, created: Date.now()};
    const userObj = new Users(userDetails);
    userObj.save()
        .then((data)=>{
          res.send(data);
        }).catch((error)=>{
          res.status(500).send('Error');
        });
  } catch (error) {
    res.send(error);
  }
});

app.post('/login/authenticate', async (req, res)=>{
  try {
     Users.find({username: req.body.username}, (err, user)=>{
      if (err) console.log(err);
    }).then((user)=>{
     
    });
    
  } catch (error) {
    console.log(error);
  }
});

app.get('/login', (req, res) => {
  return res.render('login.html');
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
