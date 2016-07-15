'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StateSchema = new Schema({
  Fullname: String,
  MobileNumber: String,
  Email: String,
  EnrollmentNo: String,
  UpdatedEnrollmentNo:String,
  Branch:String,
  sc_number: String,
  UpdatedSurname:String,
  UpdatedFirstName:String,
  UpdatedMiddleName:String,
  UpdatedEmail:String,
  UpdatedPhone:String,
  updated:Boolean,
  DataStatus:String
});

module.exports = mongoose.model('NewData', StateSchema, 'NewData');
