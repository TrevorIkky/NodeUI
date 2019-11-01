/* eslint-disable require-jsdoc */
require('dotenv').config();
const nunjucks = require('nunjucks');
const express = require('express');
const util = require('./util');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/nodecanvas', {useNewUrlParser: true, useUnifiedTopology: true});
const db =mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

mongoose.Promise = global.Promise;
const Results = require('./models/Result');
const Users = require('./models/User');

const port = 3000;
nunjucks.configure('templates', {
  autoescape: false,
  express: app,
  trimBlocks: true,
});

app.get('/', (req, res) => {
  return res.render('index.html');
});

app.get('/discover', (req, res) => {
  try {
    Results.find({}, (err, result)=>{

    }).then((result)=>{
      console.log(result);
      return res.render('discover.html', {results: result});
    }).catch((error)=>{
      console.log(error);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/search', (req, res) => {
  try {
    let searchObj = {};
    if (req.body.id) {
      searchObj = {problemId: req.body.id};
    }
    Results.find(searchObj, (err, result)=>{
    }).then((result)=>{
      return res.json(result);
    }).catch((error)=>{
      console.log(error);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});


app.post('/register/add', async (req, res) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    // eslint-disable-next-line max-len
    const userDetails = {username: req.body.username, email: req.body.email, password: hashedPass, created: Date.now()};
    const usersObj = new Users(userDetails);
    usersObj.save().then(()=>{
      res.send('OK');
    }).catch((err)=>{
      res.send('INVALID');
    });
  } catch (error) {
    res.send(error);
  }
});


app.post('/login/validate', (req, res) => {
  try {
    Users.find({username: req.body.username}, (err, user)=>{
      if (err) console.log(err);
      bcrypt.compare(req.body.password, user[0].password, (error, match)=>{
        if (match) {
          return res.send('OK');
        } else {
          return res.send('INVALID');
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

app.get('/login', (req, res) => {
  return res.render('login.html');
});

app.get('/embed/:id', (req, res) => {
  if(req.params.id.startsWith('routing')) {
    template = 'map.output.njk';
  }
  const vals = {
    problemId: req.params.id,
    resultsURL: '/routing/'+ req.params.id,
    accessToken: 'pk.eyJ1IjoiaWtreTExMSIsImEiOiJjazE3aGV1dDgwNTl4M2lyMmFzZ3lmMmdyIn0.ri7326moGLA5Bri_hYzSCQ',
  };

  const renderedTemplate = nunjucks.render(template, vals);
  res.json({ embedding: renderedTemplate });
});

app.get('/routing/:id', getRoutingResults, (req, res) => {
  res.json(res.results);
});
app.get('/results/:id', (req, res) => {
  const vals = {
    problemId: req.params.id,
    resultsURL: '/routing/'+ req.params.id,
   accessToken: 'pk.eyJ1IjoiaWtreTExMSIsImEiOiJjazE3aGV1dDgwNTl4M2lyMmFzZ3lmMmdyIn0.ri7326moGLA5Bri_hYzSCQ',
  };
  res.render('map.output.njk', vals);
});

app.post('/routing', (req, res) => {
  const data = req.body.data;
  const vals = {
    matrix: data['distanceMatrix'][0],
    vehicles: data['vehicles'][0],
    start: 0,
  };
  let template = 'tsp.cc.njk';

  if (data.vehicles[0] > 1) {
    template = 'vrp.cc.njk';
  }

  if (data['vehicleCapacities'].length > 0) {
    vals['vehicle_capacities'] = data.vehicleCapacities[0];
    template = 'cap.cc.njk';
    if (data['packageSizes'].length > 0) {
      vals['demands'] = data.packageSizes[0];
    }
  }
  const renderedTemplate = nunjucks.render(template, vals);
  const base = util.create_source('routing', renderedTemplate);
  util.compile_and_run(base, function(results) {
    results["problemId"] = base.split('/')[2];
    results["locations"] = data.meta.locations;
    const resultsObj = new Results.Routing(results);
    resultsObj.save().then(()=>{
      console.log(results);
      res.status(201).location('/routing/' + base).send();
    }).catch((err)=>{
      console.log(err);
      res.status(422).json({ message: "Could not save results"});;
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

async function getRoutingResults(req, res, next) {
  let results;
  let searchedResult;
  try {
    results = await Results.Routing.find({problemId: req.params.id}, (err, result)=>{
      searchedResult = result;
    });
    if (results == null) {
      return res.status(404).json({ message: "Cannot find problem results"});
    }
  } catch (err) {
    return res.status(500).json({ message: err.message});
  } 

  res.results = searchedResult;
  next();
}
