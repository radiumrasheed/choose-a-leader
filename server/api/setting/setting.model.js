'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SettingSchema = new Schema({
  name: String,
  label: String,
  value: String,
  type: String
});

module.exports = mongoose.model('Setting', SettingSchema);