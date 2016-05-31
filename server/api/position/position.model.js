'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PositionSchema = new Schema({
  name: String,
  description: String,
  code: String,
  candidates: [{
    _member: { type: Schema.Types.ObjectId, ref: 'Member' },
    bio: String,
    photo: String,
    secure_url: String,
    url: String,
    public_id: String,
    code: String
  }],
  _poll: { type: Schema.Types.ObjectId, ref: 'Poll' },
  votes: Number,
  index: Number
});

module.exports = mongoose.model('Position', PositionSchema);