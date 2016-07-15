'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
  NameFix: Boolean,
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
  confirmedBy: { type: Schema.Types.ObjectId, ref: 'Auth' },
  prevModifiedBy: String,
  prevModifiedDate: Date,
  prevDataModified: {type: Schema.Types.Mixed },
  createdBy: String,
  createdDate: Date,
  emailIsMatch: Boolean,
  phoneIsMatch: Boolean,
  deleted: {type: Boolean, default: false},
  getData:false
});

module.exports = mongoose.model('VotersReg', StateSchema, 'VotersRegister');
