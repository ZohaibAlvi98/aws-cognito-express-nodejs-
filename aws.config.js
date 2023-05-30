'use strict';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider"); 

module.exports = function(app){
    const client = new CognitoIdentityProviderClient({
        region: process.env.region,
        credentials: {
          accessKeyId: process.env.AWS_accessKeyId,
          secretAccessKey: process.env.AWS_secretAccessKey
        }
    });
    app.locals.client = client
}



