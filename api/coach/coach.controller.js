'use strict';

const coachModel = require('./coach.model');

function handleError(res,error,code){
    if(error.message.includes("userId_1 dup key")){
        res.status(code).send({success: false, message:"You have already created a coach"});
    }else{
        res.status(code).send({success: false, message:error.message.split(':').pop().trim()});
    }
}

exports.create = async function(req, res) {
    try{
        const {userId} = req.userData
        req.body.userId = userId
        await coachModel.create(req.body, async(err,coach)=>{
            if(err) return handleError(res,err,500);
            res.send({
                success: true,
                coach
            })
        })
    }catch(e){
        handleError(res,error,500);
    }
  }

exports.update = async function(req, res) {
    try{
        await coachModel.findOneAndUpdate({userId: req.userData.userId},req.body, async(err,coach)=>{
            if(err) return handleError(res,err,500);
            res.send({
                success: true
            })
        })
    }catch(e){
        handleError(res,error,500);
    }
}

exports.fetch = async function(req, res) {
    try{
        await coachModel.findOne({userId: req.userData.userId}, async(err,coach)=>{
            if(err) return handleError(res,err,500);
            res.send({
                success: true,
                coach:coach
            })
        })
    }catch(e){
        handleError(res,error,500);
    }
}

