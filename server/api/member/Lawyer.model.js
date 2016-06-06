'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var MemberSchema = new Schema({
  fullname: String,
  yearCalled: String,
  scNumber: String
});

module.exports = mongoose.model('Lawyer', MemberSchema,'Lawyers');
