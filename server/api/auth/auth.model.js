/**
 * Created by oladapo on 6/27/15.
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt   = require('bcrypt-nodejs');

var pRef = require('../../components/tools/pRef');

var userSchema = new Schema({
    username : {
        type: String,
        unique: true,
        lowercase: true
    },
    email : {
        type: String,
        lowercase: true
    },
    password     : {
        type: String,
        select: false
    },
    otp     : {
        type: String,
        select: false,
        default: null
    },
    requestCode: String,
    changedPassword: { type: Boolean, default: false },
    name: String,
    role: {
        type: String,
        default: 'member'
    },
    superAdmin: { type: Boolean, default: false },
    _member: { type: Schema.Types.ObjectId, ref: 'Member' },
    lastLogin: Date,
    lastModified: {
        type: Date,
        default: Date.now
    },
    resetToken: String,
    tokenExpires: Date
});

// methods ======================
userSchema.statics.randomString = function(size) {
    size = size || 32;
    return pRef(size);
};

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password, done) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Auth', userSchema);