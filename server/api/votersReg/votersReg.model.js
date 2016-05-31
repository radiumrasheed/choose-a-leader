'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
  fullname: String,
  mobileNumber: String,
  email: String,
  verifiedStatus:String,
  branchCode:String
});

module.exports = mongoose.model('VotersReg', StateSchema, 'VotersRegister');
