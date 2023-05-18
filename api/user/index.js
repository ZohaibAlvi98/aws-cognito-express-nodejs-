'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');
const { createUser,loginUser,signupOtp,socialLogin, update,changePassword, resetPassword, checkReset,generateEmail} = require('./user.validator');

var router = express.Router();

router.post('/register',createUser, controller.create);

router.post('/login',loginUser, controller.login);

router.post('/signup/otp',signupOtp, controller.verifySignupOtp);

router.post('/social/login',socialLogin, controller.socialLogin);

router.get('/details',auth.isUserAuthenticated(), controller.userDetails);

router.post('/update',update,auth.isUserAuthenticated(), controller.update);

router.get('/users',auth.isAdmin(), controller.users);

router.post('/generate/email',generateEmail, controller.generateEmail);

router.post('/check/otp', checkReset ,controller.checkToken);

router.post('/reset/password', resetPassword ,controller.resetPassword);

router.post('/change/password',changePassword,auth.isUserAuthenticated(), controller.changePassword);



module.exports = router;
