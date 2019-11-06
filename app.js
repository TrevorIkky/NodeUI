/* eslint-disable require-jsdoc */
require('dotenv').config();
const nunjucks = require('nunjucks');
const express = require('express');
const util = require('./util');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const randomString = require('randomstring');
const fs = require('fs');
const session = require('client-sessions');


const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(session({
  cookieName: 'session',
  secret: randomString.generate(10),
  duration: 60 * 60 * 1000,
  activeDuration: 60 * 60 * 1000,
}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/nodecanvas', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to database'));

mongoose.Promise = global.Promise;

const Results = require('./models/Result');
const Users = require('./models/User');
const Progress = require('./models/Completion');

const port = 3000;
nunjucks.configure('templates', {
  autoescape: false,
  express: app,
  trimBlocks: true,
});

app.get('/', (req, res) => {
  const sessionData = {
    username: (req.session.username) ? (req.session.username) : 'Account',
    userid: (req.session.userid) ? (req.session.userid) : '',
    progressid: '',
  };
  return res.render('index.html', sessionData);
});

app.get('/project/:id', (req, res)=>{
  const sessionData = {
    username: (req.session.username) ? (req.session.username) : 'Account',
    userid: (req.session.userid) ? (req.session.userid) : '',
    progressid: req.params.id,
  };
  return res.render('index.html', sessionData);
});

app.post('/projectprogress', (req, res)=>{
  try {
    Progress.find({_id: req.body.id}, (err, result)=>{
      if (err) {
        return res.send('Error');
      }
      fs.readFile(result[0].progressPath, 'utf8', (err, data)=>{
        if (err) {
          return res.send('Error');
        }
        return res.json(data);
      });
    });
  } catch (error) {

  }
});


app.get('/profile', (req, res)=>{
  if (req.session.userid != '' && req.session.userid) {
    try {
      Progress.find({userId: req.session.userid}, (err, result)=>{
      }).then((result)=>{
        // eslint-disable-next-line max-len
        return res.render('profile.html', {projects: result, username: req.session.username, userid: req.session.userid, desc: req.session.desc});
      }).catch((err)=>{
        return res.send('Error');
      });
    } catch (err) {
      return res.send('Error');
    }
  } else {
    return res.send('Error');
  };
});

app.post('/profileupdate', (req, res)=>{
  if (req.session.userid != '' && req.session.userid) {
    // eslint-disable-next-line max-len
    console.log(req.body.desc);
    const newValues = {$set: {profileUrl: req.body.profileUrl, username: req.body.username, about: req.body.desc}};
    Users.where({_id: req.session.userid}).updateOne(newValues, (err, count)=>{
      if (err) {
        res.send('Err');
      }
      console.log(count);
      return res.redirect('/profile');
    });
  } else {
    res.send('Error');
  }
});

app.get('/logout', (req, res)=>{
  req.session.reset();
  return res.redirect('/');
});

app.get('/discover', (req, res) => {
  try {
    Progress.find({}, (err, result)=>{
    }).then((result)=> {
      const arr = result;
      currentIndex = arr.length;
      while (currentIndex !== 0) {
        // Get a random index
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // Swap the values
        const temporaryValue = arr[currentIndex];
        arr[currentIndex] = arr[randomIndex];
        arr[randomIndex] = temporaryValue;
      }
      return res.render('discover.html', {results: arr});
    }).catch((error)=>{
      return res.send(error);
    });
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.post('/search', (req, res) => {
  try {
    let searchObj = {};
    if (req.body.id) {
      searchObj = {
       
        name: req.body.id,

      };
    }
    Progress.find(searchObj, (err, result)=>{
    }).then((result)=>{
      return res.json(result);
    }).catch((error)=>{
      console.log(error);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/save', (req, res)=>{
  const filePath = './saves/'+ randomString.generate(7)+ '.json';
  fs.writeFile(filePath, req.body.data, (error)=>{
    console.log(req.session.userid);
    if (error) res.send(error);
    // eslint-disable-next-line max-len
    if (req.session.userid != '' && req.session.userid) {
      // eslint-disable-next-line max-len
      const saveObj = new Progress({userId: req.session.userid, name: req.body.name, createdAt: Date.now(), progressPath: filePath});
      saveObj.save().then((result)=> {
        return res.send('Successfully uploaded online!');
      }).catch((err)=>{
        return res.send('Error');
      });
    } else {
      return res.send('Please log in  to save your work!');
    }
  });
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
          req.session.username = user[0].username;
          req.session.userid = user[0]._id;
          req.session.desc = user[0].about;
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
  if (req.params.id.startsWith('routing')) {
    template = 'map.output.njk';
  }
  const vals = {
    problemId: req.params.id,
    resultsURL: '/routing/'+ req.params.id,
    accessToken: 'pk.eyJ1IjoiaWtreTExMSIsImEiOiJjazE3aGV1dDgwNTl4M2lyMmFzZ3lmMmdyIn0.ri7326moGLA5Bri_hYzSCQ',
  };

  const renderedTemplate = nunjucks.render(template, vals);
  res.json({embedding: renderedTemplate});
});

app.get('/routing/:id', getRoutingResults, (req, res) => {
  res.json(res.results);
});

app.get('/results/:id', (req, res) => {
  if (req.params.id.startsWith('routing')) {
  const vals = {
    problemId: req.params.id,
    resultsURL: '/routing/'+ req.params.id,
    accessToken: 'pk.eyJ1IjoiaWtreTExMSIsImEiOiJjazE3aGV1dDgwNTl4M2lyMmFzZ3lmMmdyIn0.ri7326moGLA5Bri_hYzSCQ',
  };
  res.render('map.output.njk', vals);
  } else if (req.params.id.startsWith('scheduling')) {
    res.status(200);
  };
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
    results['problemId'] = base.split('/')[2];
    results['locations'] = data.meta.locations;
    const resultsObj = new Results.Routing(results);
    resultsObj.save().then(()=>{
      console.log(results);
      res.status(201).location('/routing/' + results["problemId"]).send();
    }).catch((err)=>{
      console.log(err);
      res.status(422).json({ message: "Could not save results"});;
    });
  });
});

app.get('/scheduling/:id', getSchedulingResults, (req, res) => {
  res.json(res.results);
});

app.post('/scheduling', (req, res) => {
  const data = req.body.data;
  console.log(data);
  const vals = {
    employeeCount: data["employeeCount"][0],
    shiftCount: data["shiftCount"][0],
    dayCount: data["dayCount"][0],
  };
  if (data["shiftRequests"].length > 0) {
    vals["shiftRequests"] = data["shiftRequests"][0];
  }
  template = 'sched.py.njk';
  const renderedTemplate = nunjucks.render(template, vals);
  const base = util.create_source('scheduling', renderedTemplate);
  util.compile_and_run(base, function(results) {
    results["problemId"] = base.split('/')[2];
    const resultsObj = new Results.Scheduling(results);
    resultsObj.save().then(()=>{
      console.log(results);
      res.status(201).location('/scheduling/' + results["problemId"]).send();
    }).catch((err)=>{
      console.log(err);
      res.status(422).json({message: 'Could not save results'}); ;
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
      return res.status(404).json({message: 'Cannot find problem results'});
    }
  } catch (err) {
    return res.status(500).json({message: err.message});
  }

  res.results = searchedResult;
  next();
}

async function getSchedulingResults(req, res, next) {
  let results;
  let searchedResult;
  try {
    results = await Results.Scheduling.find({problemId: req.params.id}, (err, result)=>{
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
