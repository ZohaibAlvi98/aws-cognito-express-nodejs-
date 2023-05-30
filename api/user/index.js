'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');
const { createUser,confirmSignUpCode,resendConfirmationCode,confirmPasswordCode,loginUser,signupOtp,socialLogin, update,changePassword, resetPassword, checkReset,generateEmail} = require('./user.validator');

var router = express.Router();

router.post('/register',createUser, controller.create);

router.post('/confirmation/code/signup',confirmSignUpCode, controller.confirmSignUpCode);

router.post('/resend/code/signup',resendConfirmationCode, controller.resendConfirmationCode);

router.get('/refresh/session', controller.refreshSession);

router.get('/forgot/password/code',confirmPasswordCode, controller.forgotPasswordCode);

router.get('/forgot/password/:username', controller.forgotPassword);

router.get('/update', controller.update);

router.get('/details', controller.userDetails);

router.post('/change/password',changePassword, controller.changePassword);


module.exports = router;
