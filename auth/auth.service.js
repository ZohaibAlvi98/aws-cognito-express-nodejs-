'use strict';
var compose = require('composable-middleware');
const jwt = require('jsonwebtoken')

var UserModel = require("../api/user/user.model");
const userSessionModel = require('../api/userSession/userSession.model');
const { awsHelperfunction } = require('../helpers/aws.helper');


function isAdmin() {
  return compose()
      // Attach user to request
      .use(function (req, res, next) {
        req.query.token = req.header('token')
          userSessionModel.findById(req.query.token, (err, sessions) => {
              if (err) {
                  //
              }
              //
              
              if (sessions != undefined) {
                  if (!sessions.isDeleted) {
                      //
                      UserModel.findOne({
                          _id: sessions.user
                      }, (err, user) => {
                     
                          if (user != null) {
                              //
                              if (user.role == 'admin') {
                                  req.user = user;
                                  next();
                              } else {
                                  res.status(403).send({
                                      success: false,
                                      message: "Account not approved"
                                  });
                              }
                          }  
                      });
                  } else {
                      res.status(404).send({
                          success: false,
                          message: "Session Deleted"
                      });
                  }
              } else {
                  res.status(404).send({
                      success: false,
                      message: "undefined"
                  })
              }
          });
      });
}


function isAuthenticated() {
 
    return compose()
        // Attach user to request
        .use(function(req, res, next) {
        
          try{
            const decoded = jwt.verify(req.header('token'),'car-parked-app-@Secret@12')
            req.userData = decoded;
            next();
          }catch(e){
            res.send({
              success: false,
              message: "Auth failed"
            })
          }
        
        });
}


function isUserAuthenticated() {
  return compose()
      // Attach user to request
      .use(function(req, res, next) {
        req.query.token = req.header('token')
        try{
            userSessionModel.findById(req.query.token, (err,session)=>{
                if(session!=null&&session.isDeleted==false){
                    UserModel.findById(session.user, (err, user)=>{
                        if(!user.otpVerification && user.socialId == undefined) return res.status(401).send({message: "verify your otp verification"})
                        if(user == null)  res.status(401).send({message: "Invalid Token!"})
                        else{
                            let users = {
                                userId: user._id
                            }
                            req.userData = users
                                next();
                        }

                        })
                }else{
                    res.send({
                        success: false,
                        message: "login"
                    })
                }
            })
        }catch(e){
            throw new Error("Invalid Token")
        }
          
      });
}

async function initiateAuth(args,res){

    try{
            const _args = { 
            AuthFlow: args.AuthFlow,
            AuthParameters: args.AuthParameters,
            ClientId: process.env.ClientId // required
        };
      
        return await awsHelperfunction(
            _args,
            args.client,
            "InitiateAuthCommand"
        )
    }catch(e){
       
        res.status(500).send({success: false, error: e.message})
    }
}

exports.initiateAuth = initiateAuth
exports.isAdmin = isAdmin;

exports.isAuthenticated = isAuthenticated;
exports.isUserAuthenticated = isUserAuthenticated;


