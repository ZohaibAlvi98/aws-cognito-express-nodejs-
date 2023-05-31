'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken')

// const UserService = require('./user.service');
const UserModel = require('./user.model'); 
const userSessionModel = require('../userSession/userSession.model');
const { sendEmail } = require('../../utils/email.service');
const { awsHelperfunction } = require('../../helpers/aws.helper');
const {initiateAuth} = require('../../auth/auth.service')


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
        const {email,password,username, fullname } = req.body
        req.body["custom:role"] = "user";
        const {client} = req.app.locals

        const user = await UserModel.find({$or:[{email: email},{username:username}]})
        
        if(user.length != 0){
            return res.status(500).send({ success: false, message: 'The specified email address or username is already in use.'})
        }

        let args = {
            ClientId: process.env.ClientId,
            Password: password,
            Username: username,
            ValidationData: [
                {Name:"custom:fullname",Value: fullname},
                {Name:"email",Value: email}
            ],
            UserAttributes: [
                {Name:"custom:fullname",Value: fullname},
                {Name:"email",Value: email}
            ],
          };

            const data = await awsHelperfunction(
                args,
                client,
                "SignUpCommand"
            )
            req.body["cognitoIdSub"] = data.UserSub;
            await UserModel.create(req.body)
                .then( async function (user){
                    res.send({
                        success: true,
                        message: "Check email for verification code."
                    })
            })
        
    }catch(e){
        res.status(500).send({
            success: false,
            message: e.message
        })
    } 
}

exports.confirmSignUpCode = async function(req,res){
    try{
        const {code, username} = req.body
        const {client} = req.app.locals
        
        let args = {
            ClientId: process.env.ClientId, /* required */
            ConfirmationCode: code, /* required */
            Username: username, /* required */
        };

        const data = await awsHelperfunction(
            args,
            client,
            "ConfirmSignUpCommand"
        )

        res.send({
            success: true,
            message: "You have Successfully Signed Up!"
        })
    }catch(e){
        res.status(500).send({
            success: false,
            message: e.message
        })
    }
}

exports.resendConfirmationCode = async function(req,res){
    try{
        const {username} = req.body
        const {client} = req.app.locals


        let args = {
            ClientId: process.env.ClientId,
            Username: username
        };
        
        const data = await awsHelperfunction(
            args,
            client,
            "ResendConfirmationCodeCommand"
        )

        res.send({
            success: true,
            message: "Code sent Successfully"
        })
    }catch(e){
        res.status(500).send({
            success: false,
            message: e.message
        })
    }
    
}

exports.login = async function(req, res){
    try{
        let {username, password} = req.body
        const {client} = req.app.locals

        await UserModel.findOne({
            username
        }, async(err,user)=>{
            if(err){
                res.status(500).send({success: false, error: err})
                
            }
            if(user!=null){
                
                const args = { 
                    AuthFlow: "USER_PASSWORD_AUTH",
                    AuthParameters: { // AuthParametersType
                      "USERNAME": username,
                      "PASSWORD": password
                    },
                    client
                  };

                const data = await initiateAuth(args,res)
                
                if(data!= null){
                    delete data["$metadata"]
                    delete data["ChallengeParameters"]

                    res.send({
                        success: true,
                        data: data
                    })
                }
            }else{
                res.status(500).send({ success: false, error: "User not found"})
              
            }
        })
    }catch(e){
        res.status(500).send({success: false, error: e.message})
    } 
}

exports.refreshSession = async function (req,res) {
    try{
        const refreshToken = req.header('refreshToken')
        const {client} = req.app.locals


        const args = { 
            AuthFlow: "REFRESH_TOKEN",
            AuthParameters: { // AuthParametersType
            "REFRESH_TOKEN": refreshToken
            },
            client
        };

        const data = await initiateAuth(args,res)

        if(data != null){
            delete data["$metadata"]
            delete data["ChallengeParameters"]

            res.send({
                success: true,
                data: data
            })
        }
    }catch(e){
        res.status(500).send({success: false, error: e.message})
    }
}

exports.forgotPassword = async function (req,res) {
    try{
        const {username} = req.params
        const {client} = req.app.locals

        const args = {
            ClientId: process.env.ClientId, /* required */
            Username: username, /* required */
        };
      
        const data = await awsHelperfunction(
            args,
            client,
            "ForgotPasswordCommand"
        )

        res.send({
            success: true,
            message: "Check email for verification code"
        })
    }catch(e){
        res.status(500).send({success: false, error: e.message})
    }
}

exports.forgotPasswordCode = async function (req,res) {
    try{
        const {username,password,code} = req.body
        const {client} = req.app.locals

        const args = {
            ClientId: process.env.ClientId, 
            Username: username,/* required */
            ConfirmationCode: code, /* required */
            Password: password /* required */
        };

        const data = await awsHelperfunction(
            args,
            client,
            "ConfirmForgotPasswordCommand"
        )

        res.send({
            success: true,
            message: "Password Reset Successfully"
        })
    }catch(e){
        res.status(500).send({success: false, error: e.message})
    }
}

exports.update = async function(req,res) {
    try{
        const {email,username,age,gender,fullname} = req.body
        const {client} = req.app.locals


        // if(email != undefined && email != null){
            
        //     const user = await UserModel.find({
        //         email:email,username: {$ne: username}
        //     })
        //     if(user.length !=0){
        //         return res.status(500).send({success: false, error: "This email already exists"})
        //     }

        // }

        let obj = {...req.body}
        delete obj["username"]

        let names = Object.keys(obj)
        let val = Object.values(obj)

        let userAttributes = []
        val.map((v,i) => {
            userAttributes.push({Name: `custom:${names[i]}`, Value: v})
        })

        const args = {
            AccessToken: req.header('accessToken'), /* required */
            UserAttributes: userAttributes,
          };
          const data = await awsHelperfunction(
            args, 
            client,
            "UpdateUserAttributesCommand"
        )
        
        const user = await UserModel.findOneAndUpdate({username: username},req.body)

         res.send({
            success: true,
            message: "Updated Successfully!"
         })   

    }catch(e){
        res.status(500).send({success: false, error: e.message})
    }

    // const attributeList = [];

    // const params = {
    //     UserPoolId: poolData.UserPoolId, /* required */
    //     AttributesToGet: [
    //       'email'
    //       /* more items */
    //     ],
    //     Filter: "email = \"zohaib.alvi900@gmail.com\"",
    //     Limit: 1
    //   };
}

exports.changePassword = async function(req,res) {
    try{
        const {previousPassword, newPassword} = req.body
        const {client} = req.app.locals

        const args = {
            PreviousPassword: previousPassword, // required
            ProposedPassword: newPassword, // required
            AccessToken: req.header('accessToken'), // required
        };
        const data = await awsHelperfunction(
            args,
            client,
            "ChangePasswordCommand"
        )
        
         res.send({
            success: true,
            message: "Updated Successfully!"
         })   

    }catch(e){
        res.status(500).send({success: false, error: e.message})
    }

    // const attributeList = [];

    // const params = {
    //     UserPoolId: poolData.UserPoolId, /* required */
    //     AttributesToGet: [
    //       'email'
    //       /* more items */
    //     ],
    //     Filter: "email = \"zohaib.alvi900@gmail.com\"",
    //     Limit: 1
    //   };
}

exports.userDetails = async function(req, res){
    try{
        const args = {
            AccessToken: req.header("accessToken"), // required
        };
        const {client} = req.app.locals


        const data = await awsHelperfunction(
            args,
            client,
            "GetUserCommand"
        )
        delete data["$metadata"]
        
        res.send({
            success: true,
            data: data
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

// exports.changePassword = async function(req, res){
//     try{
//         const {userData} = req
//         const {password} = req.body

//         let {salt,hashedPassword} = hashingPassword(password)

//         await UserModel.findByIdAndUpdate({_id: userData.userId},{hashedPassword: hashedPassword,salt: salt},async(err,user)=>{
//             if(user == null){
//                 res.status(500).send({ success: false,error: 'No user found'})
//            }else{
//                 res.send({
//                     success: true,
//                     message: "Password has been reset successfully"
//             })
//            }
           
//         })
//     }catch(e){
//         res.status(500).send({ success: false,error: e.message})
//     } 
// }

// exports.userDetails = async function(req, res){
//     try{
//         await UserModel.findById({_id: req.userData.userId},'username email age fullname').then( async function (users){

//             res.send({
//                 users:users
//             })
       
//         })
//         .catch(function(error){

//             handleError(res,error,500);          
//         })
            
//     }catch(e){
//         res.send({
//             success: false,
//             message: e.message
//         })
//     } 

// }

// exports.update = async function(req, res){
//     try{
//         await UserModel.findByIdAndUpdate({_id: req.userData.userId},req.body,async(err,users)=>{
//             if(err){

//             }else{
//                 res.send({
//                     users:true
//                 })
//             }
            

//     }).catch(function(error){

//         if(error.errors && error.errors.email && error.errors.email.message == 'The specified email address is already in use.'){
//             res.send({message: 'The specified email address is already in use.', success: false})
//         }else if(error.errors && error.errors.email && error.errors.email.message == "`Email` is required."){
//             res.send({message: 'Email is required', success: false})
//         }else if(error.message == 'Invalid password'){
//             res.send({message: 'Invalid password', success: false})
//         }
//         if(error.code == 11000){
//             if(error.keyValue.hasOwnProperty('username')){
//                 return res.send({success:false, message: 'This username already exists'})
//             }
//             res.status(422).send({success: false,message: 'This email address is already be in use'})
           
//         }
//         else{

//             handleError(res,error,500);
//         }
       
        
//     })
//     }catch(e){
//         res.send({
//             success: false,
//             message: e.message
//         })
//     } 

// }

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

