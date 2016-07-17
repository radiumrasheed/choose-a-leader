'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ContestantSchema = new Schema({
  fullname: String,
  post: String,
  profile:String,
  secure_url: String
});

module.exports = mongoose.model('Contestant', ContestantSchema, 'Contestants');

