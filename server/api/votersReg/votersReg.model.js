'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
  fullname: String,
  mobileNumber: String,
  email: String,
  verifiedStatus:String,
  branchCode:String,
  updatedScNumber:String,
  updatedSurname:String,
  updatedFirstName:String,
  updatedMiddleName:String,
  updatedEmail:String,
  updatedPhone:String,
  updatedTime: String,
  updated:Boolean
});

module.exports = mongoose.model('VotersReg', StateSchema, 'VotersRegister');
