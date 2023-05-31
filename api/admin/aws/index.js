'use strict';

const express = require('express');
const controller = require('./aws.controller');

const router = express.Router();

router.post('/update', controller.update);

router.post('/create/attributes', controller.createAttributes);

router.post('/create/identity/providers', controller.createIdentityProviders);

router.post('/create/userpool', controller.createUserPool);

router.post('/create/userpool/client', controller.createUserPoolClient);

router.post('/delete/userpool', controller.deleteUserPool);



module.exports = router;
