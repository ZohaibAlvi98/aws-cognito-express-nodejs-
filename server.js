'use strict';
const dotenv = require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const busboyBodyParser = require('busboy-body-parser');
const path = require('path');
const app = express();
// var compression = require('compression');
var cors = require('cors');

const PORT = process.env.PORT;

global.ROOTPATH = __dirname;
const moment = require('moment');


app.locals.moment = require('moment');

app.use(express.urlencoded({extended: true})); 
app.use(express.json());       
app.use(busboyBodyParser());

app.get('/dist-user-images/:filename', function(req, res) {
  var filename = req.params.filename.replace(/'/g, '');
  res.sendFile(path.resolve('./dist/App/assets/images/user/' + filename));
});

app.get('/images/products/:filename', function(req, res) {
  var filename = req.params.filename.replace(/'/g, '');
  res.sendFile(path.resolve('./images/brands/products/' + filename));
});

app.get('/images/logo/:filename', function(req, res) {
  var filename = req.params.filename.replace(/'/g, '');
  res.sendFile(path.resolve('./images/brands/logo/' + filename));
});



app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', "access-control-allow-headers,access-control-allow-origin,content-type,Authorization_Token,Authorization_Br_Token,Service_ID,token");

  if (req.method === 'OPTIONS') {
      res.sendStatus(200);
  } else {
      next();
  }
});

// app.use(compression());

require('./db.config')(app);
require('./routes')(app);
require('./aws.config')(app)

app.listen(PORT, function() {
  console.log('Server listening on PORT : ' + PORT);
})
