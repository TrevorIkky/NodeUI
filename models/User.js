const mongoose = require('mongoose');

const usersDB = mongoose.createConnection('mongodb://localhost:27017/nodecanvas',
  {useNewUrlParser: true, useUnifiedTopology: true});
usersDB.on('error', (error) => console.error(error));
usersDB.once('open', () => console.log('Connected to Users database'));

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  created: Date,

});

module.exports = usersDB.model('users', usersSchema);
