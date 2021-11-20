'use strict';
require('dotenv').config();

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session     = require('express-session');
const passport    = require('passport');
const mongo       = require('mongodb').MongoClient;
const ObjectID    = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
const MONGO_URI= 'mongodb+srv://@cluster0.yi6md.mongodb.net/advancednode'
const app = express();

const routes = require('./routes');
const auth = require('./auth');


const bcrypt = require('bcrypt');
const http = require('http').createServer(app);


const passportSocketIo = require('passport.socketio');

const cookieParser = require("cookie-parser");

const MongoStore = require('connect-mongo')(session);
const store = new MongoStore({ url: MONGO_URI });
const myDB = require('./connection');


fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set("views", "./views/pug");

app.use(passport.initialize());
app.use(passport.session());

let io = require('socket.io')(http);
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);
myDB(async (client) => {
  const myDataBase = await client.db('database').collection('users');

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  
  io.on('connection', (socket) => {
    ++currentUsers;
    io.emit('user'),{
        name: socket.request.user.name,
  currentUsers,
  connected: true
} 
    socket.on('chat message', (message) => {
      io.emit('chat message', { name: socket.request.user.name, message });
    });
    console.log('user ' + socket.request.user.username + ' connected');

    socket.on('disconnect', () => {
      console.log('A user has disconnected');
      --currentUsers;
      io.emit('user'),{
         name: socket.request.user.name,
         currentUsers,
         connected: false
        }
    
      
    });
  });
}).catch((e) => {
  app.route('/').get((req, res) => {
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}







       