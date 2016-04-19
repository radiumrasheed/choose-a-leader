'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MemberSchema = new Schema({
  title: String,
  firstName: String, 
  middleName: String,
  surname: String,
  othername: String,
  dateOfBirth: Date,
  date_of_birth: String,
  gender: String,
  address: String,
  state_of_origin: String,
  phoneNumber: Number,
  phone: String,
  nbaNumber: String,
  scNumber: String,
  sc_number: String,
  email: String,
  year_called: Number,
  accessCode: String,
  codeConfirmed: Boolean,
  branch: String,
  verified: Number,
  _branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  _user: { type: Schema.Types.ObjectId, ref: 'Auth' },
  lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Member', MemberSchema);