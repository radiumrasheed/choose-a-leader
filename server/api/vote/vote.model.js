'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VoteSchema = new Schema({
  _member: { type: Schema.Types.ObjectId, ref: 'Member' },
  candidate: { type: Schema.Types.ObjectId, ref: 'Member' },
  _position: { type: Schema.Types.ObjectId, ref: 'Position' },
  _poll: { type: Schema.Types.ObjectId, ref: 'Poll' },
  ipAddress: String,
  voteDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vote', VoteSchema);