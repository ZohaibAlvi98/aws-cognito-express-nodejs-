'use strict';

const path = require('path');
const fs = require('fs');

const _ = require('lodash');
const moment = require('moment');

const UserSessionModel = require('./userSession.model');
const UserModel = require('../user/user.model');

exports.verify = async function(req, res) {
    req.query.token = req.header('Authorization_Token')
   
  
    if (req.query.token != undefined) {
      try {
        
        UserSessionModel.findById(req.query.token, async (err, sessions) => {
          if (err) {
          }
       
          if (sessions != undefined) {
            if (!sessions.isDeleted) {
              //console.log(sessions.userId);
              await UserModel.findById( sessions.user.toString()
              , (err, user) => {
             
                if(user.length !=0 && user != null){
               
                    res.send({
                      success: true,
                      user: user
                    });
                  
              }
          })
      }
  }
        })
      }catch (e) {
          res.send({
            success: false,
            messaage: "undefined"
          })
        }
  }
  }
