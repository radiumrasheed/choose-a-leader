'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var EnquirySchema = new Schema({
  email: String,
  phone: String,
  title: String,
  message: String,
  timeSent: String,
  name: String,
  resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
