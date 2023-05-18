'use strict';

const fs = require('fs');
const path = require('path');
var crypto = require('crypto');
const jwt = require('jsonwebtoken')

// const UserService = require('./user.service');
const UserModel = require('./user.model'); 
const userSessionModel = require('../userSession/userSession.model');
const { sendEmail } = require('../../utils/email.service');


function handleError(res,error,code){
    if(error.message.includes(",")){
        res.status(code).send({success: false, message:error.message.split(',')[0]});
    }else{
        res.status(code).send({success: false, message:error.message.split(':').pop().trim()});
    }
}

function hashingPassword(password){
    let salt = crypto.randomBytes(16).toString('base64')
    let bufferSalt = new Buffer.from(salt, 'base64');
    let hashedPassword = crypto.pbkdf2Sync(password, bufferSalt, 10000, 64 , 'sha512').toString('base64');
    return {salt,hashedPassword}
}

exports.create = async function(req,res){
    try{
        req.body.role = "user";
        req.body.otpVerification = false
        req.body.signupOtp = Math.floor(100000 + Math.random() * 9000);

        const {email,password,username} = req.body
        if(email == undefined || password == undefined || email == null || password == null){
            res.send({message: 'Email and password is required'})
        }
        await UserModel.find({$or:[{email: email},{username:username}]}, async(err,user)=>{
            
            if(user.length != 0){
                return res.send({message: 'The specified email address or username is already in use.'})
            }else{
                
                await UserModel.create(req.body)
                .then( async function (user){
                    const _args = {
                        email: req.body.email,
                        reset_token: req.body.signupOtp,
                        service: "gmail",
                        type: "signup"
                    };
                    await sendEmail(_args);
                    return res.send({success: true, message: "Email sent successfully"})   
                    
        
                })
        .catch(function(error){
            if(error.errors && error.errors.email && error.errors.email.message == "`Email` is required."){
                res.send({message: 'Email is required', success: false})
            }else if(error.message == 'Invalid password'){
                res.send({message: 'Invalid password', success: false})
            }
            if(error.code == 11000){
                if(error.keyValue.hasOwnProperty('username')){
                    res.send({success:false, message: 'This username already exists'})
                }
            
            }
            else{
                handleError(res,error,500);
            }
        
            
        })
            }
        })
        
    }catch(e){
        res.send({
            success: false,
            message: e.message
        })
    } 
}

exports.verifySignupOtp = async function(req, res){
    try{

        await UserModel.findOne({signupOtp: req.body.otp,email: req.body.email},async(err,user)=>{
            if(!user){
                res.status(500).send({ success: false,error: 'Invalid Token.'})
            }else{
                await UserModel.findOneAndUpdate({signupOtp: req.body.otp},{otpVerification: true},async(err,user)=>{
                    userSessionModel.create({user: user._id}, (err, raw)=>{ 
                                    
                        res.send({success: true, token: raw._id, message: 'Signed Up Successfully!'})
                    })
                })
            }
        })
        
            
    }catch(e){
        res.status(500).send({ success: false,error: e.message})
    } 

}

exports.login = async function(req, res){
    try{
        let {username, password} = req.body
        await UserModel.findOne({
            username
        }, (err,user)=>{
            if(err){
                res.status(500).send({success: false, error: err})
                
            }
            if(user!=null){
                
                if(user.authenticate(password)){
                    // const token = jwt.sign({
                    //     email: user.email,
                    //     userId: user._id
                    // }, 'car-parked-app-@Secret@12', {
                    //     expiresIn: "2 days"
                    // })
                    userSessionModel.create({user: user._id}, (err, raw)=>{ 
                        
                        res.send({success: true, token: raw._id, message: 'Successfull Login'})
                    })
                   
                   
                }else{
                    res.status(500).send({success: false, error: "Incorrect password."})
                   
                }
            }else{
                res.status(500).send({ success: false, error: "User not found"})
              
            }
        })
    }catch(e){
        res.status(500).send({success: false, error: e.message})
    } 
}

exports.socialLogin = async function(req, res){
    try{
        let {socialId,socialType} = req.body
        
        await UserModel.findOne({
            socialId
        }, (err,user)=>{
            if(err){
                res.status(500).send({success: false, error: err})
                
            }

            if(user!=null){
                
                userSessionModel.create({user: user._id}, (err, raw)=>{ 
                    
                    res.send({success: true, token: raw._id, message: 'Successfull Login'})
                })
                   
            }else{
                req.body.provider = socialType;
                UserModel.create(req.body)
                .then( async function (user){
                    userSessionModel.create({user: user._id}, (err, raw)=>{ 
                                
                        res.send({success: true, token: raw._id, message: 'Signed Up Successfully!'})
                    })
                
                })
                .catch(function(error){
                    handleError(res,error,500);

                
                    
                })
            }
            
        })
    }catch(e){
        res.status(500).send({success: false, error: e.message})
    } 
}

exports.generateEmail = async function(req, res){
    try{
        console.log(req.body.email,'dddew')
        await UserModel.findOne({email: req.body.email},async(err,user)=>{
            if(user == null){
                res.status(500).send({ success: false,error: 'This Email does not exists' })
            }else{
                const resetToken = Math.floor(100000 + Math.random() * 9000);
                const _args = {
                    email: user.email,
                    reset_token: resetToken,
                    service: "gmail",
                    type: "forget"
                  };
                  await sendEmail(_args);
                  await UserModel.findByIdAndUpdate({_id: user._id},{resetToken: resetToken})
                  res.send({success: true, message: "Email sent successfully"})
            }
            

    })
    }catch(e){
        res.status(500).send({ success: false,error: e.message})
    } 

}

exports.checkToken = async function(req, res){
    try{
        await UserModel.findOne({resetToken: req.body.resetToken},async(err,user)=>{
            if(!user){
                res.status(500).send({ success: false,error: 'Invalid Token.'})
            }else{
                res.send({
                    success: true,
                    message: 'Token Verified'
                })
            }
        })
    }catch(e){
        res.status(500).send({ success: false,error: e.message})
    } 
}

exports.resetPassword = async function(req, res){
    try{
        const {password,resetToken} = req.body

        let {salt,hashedPassword} = hashingPassword(password)

        await UserModel.findOneAndUpdate({resetToken: resetToken},{hashedPassword: hashedPassword,salt: salt,resetToken: ""},async(err,user)=>{
            if(user == null){
                res.status(500).send({ success: false,error: 'No user found'})
           }else{
                res.send({
                    success: true,
                    message: "Password has been reset successfully"
            })
           }
           
        })
    }catch(e){
        res.status(500).send({ success: false,error: e.message})
    } 
}

exports.changePassword = async function(req, res){
    try{
        const {userData} = req
        const {password} = req.body

        let {salt,hashedPassword} = hashingPassword(password)

        await UserModel.findByIdAndUpdate({_id: userData.userId},{hashedPassword: hashedPassword,salt: salt},async(err,user)=>{
            if(user == null){
                res.status(500).send({ success: false,error: 'No user found'})
           }else{
                res.send({
                    success: true,
                    message: "Password has been reset successfully"
            })
           }
           
        })
    }catch(e){
        res.status(500).send({ success: false,error: e.message})
    } 
}

exports.userDetails = async function(req, res){
    try{
        await UserModel.findById({_id: req.userData.userId},'username email age fullname').then( async function (users){

            res.send({
                users:users
            })
       
        })
        .catch(function(error){

            handleError(res,error,500);          
        })
            
    }catch(e){
        res.send({
            success: false,
            message: e.message
        })
    } 

}

exports.update = async function(req, res){
    try{
        await UserModel.findByIdAndUpdate({_id: req.userData.userId},req.body,async(err,users)=>{
            if(err){

            }else{
                res.send({
                    users:true
                })
            }
            

    }).catch(function(error){

        if(error.errors && error.errors.email && error.errors.email.message == 'The specified email address is already in use.'){
            res.send({message: 'The specified email address is already in use.', success: false})
        }else if(error.errors && error.errors.email && error.errors.email.message == "`Email` is required."){
            res.send({message: 'Email is required', success: false})
        }else if(error.message == 'Invalid password'){
            res.send({message: 'Invalid password', success: false})
        }
        if(error.code == 11000){
            if(error.keyValue.hasOwnProperty('username')){
                return res.send({success:false, message: 'This username already exists'})
            }
            res.status(422).send({success: false,message: 'This email address is already be in use'})
           
        }
        else{

            handleError(res,error,500);
        }
       
        
    })
    }catch(e){
        res.send({
            success: false,
            message: e.message
        })
    } 

}

exports.users = async function(req, res){
    try{
        await UserModel.find({},'username email age fullname',async(err,users)=>{
            if (err) throw new Error(err);
            res.send({
                users:users
            })

    })
    }catch(e){
        res.send({
            success: false,
            message: e.message
        })
    } 

}

