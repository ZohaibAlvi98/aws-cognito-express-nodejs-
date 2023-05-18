'use strict';

var express = require('express');
var controller = require('./coach.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/create',auth.isUserAuthenticated(), controller.create);

router.post('/update',auth.isUserAuthenticated(), controller.update);

router.get('/fetch',auth.isUserAuthenticated(), controller.fetch);


module.exports = router;
