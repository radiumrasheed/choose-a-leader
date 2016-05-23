'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PersonSchema = new Schema({
	phone: String,
	sc_number: String,
	fullname: String,
	email: String,
	branch: String,
	_branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
	_user: { type: Schema.Types.ObjectId, ref: 'Auth' },
	lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Person', PersonSchema, 'Persons');