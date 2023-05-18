const Joi = require('joi');
const { validateRequest } = require('../../utils/validator.helper');

exports.createUser = async function createUser(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        fullname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema,res);
}

exports.loginUser = async function loginUser(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema,res);
}

exports.signupOtp = async function signupOtp(req, res, next) {
    const schema = Joi.object({
        otp: Joi.string().required(),
        email: Joi.string().required()
    });
    validateRequest(req, next, schema,res);
}

exports.socialLogin = async function socialLogin(req, res, next) {
    const schema = Joi.object({
        socialId: Joi.string().required(),
        socialType: Joi.string().required()
    });
    validateRequest(req, next, schema,res);
}

exports.update = async function update(req, res, next) {
    const schema = Joi.object({
        username: Joi.string(),
        email: Joi.string(),
        age: Joi.string(),
        fullname: Joi.string()
    });
    validateRequest(req, next, schema,res);
}

exports.changePassword = async function changePassword(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema,res);
}

exports.resetPassword = async function resetPassword(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        resetToken: Joi.string().required()
    });
    validateRequest(req, next, schema,res);
}

exports.checkReset = async function checkReset(req, res, next) {
    const schema = Joi.object({
        resetToken: Joi.string().required()
    });
    validateRequest(req, next, schema,res);
}

exports.generateEmail = async function generateEmail(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required()
    });
    validateRequest(req, next, schema,res);
}





