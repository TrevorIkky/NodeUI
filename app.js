require('dotenv').config();
const nunjucks = require('nunjucks');
const express = require('express');
const fs = require('fs');
const util = require('./util');
const bcrypt = require('bcrypt');

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


app.post('/register/add', async (req, res)=>{
  try {
    const hashedPass = await bcrypt.hash(req.password, 10);
    // eslint-disable-next-line max-len
    const userDetails = {name: req.body.username, email: req.body.email, password: hashedPass, created: Date.now()};
    console.log(userDetails);
    // Add userdetails obj to mongo
    res.status(201).send('Added Successfully');
  } catch (error) {
    res.send(error);
  }
});

app.post('/login/authenticate', async (req, res)=>{
  try {
    // run Query to get username and password from db
    if (await bcrypt.compare(req.body.password, 'Password from db')) {
      res.render('index.html');
    } else {
      res.send('Incorrect password');
    }
  } catch (error) {
    console.log(error);
  }

});

app.get('/login', (req, res) => {
  return res.render('login.html');
});

app.post('/routing', (req, res) => {
  const data = req.body.data;
  const vals = {
    matrix: data["distanceMatrix"][0],
    vehicles: data["vehicles"][0],
    start: 0,
  };
  var template = 'tsp.cc.njk';
  if (data["vehicleCapacities"].length > 0) {
    vals["vehicle_capacities"] = data.vehicleCapacities[0];
    template = 'cap.cc.njk';
    if (data["packageSizes"].length > 0) {
      vals["demands"] = data.packageSizes[0];
    }
  }
  if (data.vehicles[0] > 1) {
      template = 'vrp.cc.njk';
  }
  const renderedTemplate = nunjucks.render(template, vals);
  const base = util.create_source('routing', renderedTemplate);
  util.compile_and_run(base, function(results) {
    console.log(results);
    res.status(201).json(results);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
