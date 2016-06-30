'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
  fullname: String,
  mobileNumber: String,
  email: String,
  scNumber: String,
  verifiedStatus:String,
  branchCode:String,
  sc_number: String,
  updatedSurname:String,
  updatedFirstName:String,
  updatedMiddleName:String,
  updatedEmail:String,
  updatedPhone:String,
  updatedTime: String,
  updated:Boolean,
  confirmed:Boolean,
  confirmedBy: { type: Schema.Types.ObjectId, ref: 'Auth' }
});

module.exports = mongoose.model('VotersReg', StateSchema, 'VotersRegister');
