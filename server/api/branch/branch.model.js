'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BranchSchema = new Schema({
  name: String,
  state: String
});

module.exports = mongoose.model('Branch', BranchSchema);