'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BranchRequestSchema = new Schema({
  _member: { type: Schema.Types.ObjectId, ref: 'Member' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Auth' },
  branch: String,
  email: String,
  state: String,
  resolved: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  submitted: { type: Date, default: Date.now },
  updated: Date
});

module.exports = mongoose.model('BranchRequest', BranchRequestSchema);