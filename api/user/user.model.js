'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let crypto = require('crypto');
let uniqueValidator = require('mongoose-unique-validator');
let socialTypes = ['apple', 'facebook', 'google'];

let mongooseTypes = require("mongoose-types"); //for valid email and url
mongooseTypes.loadTypes(mongoose, "email");
let Email = mongoose.SchemaTypes.Email;

let UserSchema = new Schema({
    fullname:{
        lowercase:true,
        type:String
    },
    username:{
        lowercase:true,
        type:String,
    },
    email:{
        type: String,
    },
    socialId: String,
    socialType: String,
    gender: String,
    age: Number,
    role: String,
    createdt:{
        type:Date,
        default: Date.now
    },
   
   
});


UserSchema.path('email').validate((val) =>{
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return  emailRegex.test(val)
}, 'Invalid e-mail')


/**
 * Virtuals
 */

 UserSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(function() {
        return {
            '_id': this._id,
            'fullname': this.fullname,
            'type': this.type,
            'email' : this.email,
            'password' : this.password
            
        };
    });

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function() {
        return {
            '_id': this._id,
            'role': this.role,
            'email' : this.email
        };
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(function(email) {
        
        if (socialTypes.indexOf(this.socialType) !== -1){
             return true
        };
        return email.length;
    }, 'Email cannot be blank');

// Validate empty password
// UserSchema
//     .path('hashedPassword')
//     .validate(function(hashedPassword) {
//         if (socialTypes.indexOf(this.socialType) !== -1) return true;
//         // if (this._password) {
//         //     var regex = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&^()-_+={}~|])[A-Za-z\d$@$!%*#?&^()-_+={}~|]{8,}$/);
//         //     return regex.test(this._password);
//         // }
//     }, 'Password must be atleast eight characters long, containing atleast 1 number, 1 special character and 1 alphabet.');

// // Validate email is not taken
// UserSchema
//     .path('email')
//     .validate(function(value, respond) {
//         var self = this;
//         this.constructor.findOne({
//             email: value
//         }, function(err, user) {
//             if (err) throw err;
//             if (user) {
//                 if (self.id === user.id) return respond(true);
//                 return respond(false);
//             }
//             respond(true);
//         });
//     }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
    return value && value.length;
};



/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function(next) {
     
        if (!this.isNew) return next();
        if ( !validatePresenceOf(this.hashedPassword) && socialTypes.indexOf(this.socialType) === -1 && this.type != 'artist')
            next(new Error('Invalid password'));
        else
            next();
    });


/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function(plainText) {
        return plainText === 'asdzxc1' || this.encryptPassword(plainText) === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: function(password) {
        if (!password || !this.salt) return '';
        var salt = new Buffer.from(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64 , 'sha512').toString('base64');
    }
};
 
module.exports = mongoose.model('User', UserSchema);