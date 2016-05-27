'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PersonSchema = new Schema({
	phone: String,
	sc_number: String,
	surname: String,
  firstName: String,
  middleName: String,
	email: String,
	branch: String,
	lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Person', PersonSchema, 'Persons');
