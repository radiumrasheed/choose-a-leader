'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PollSchema = new Schema({
  title: String,
  description: String,
  opens: Date,
  closes: Date,
  national: { type:Boolean, default: false },
  published: { type:Boolean, default: false },
  _branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  deleted: { type:Boolean, default: false },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Auth' },
	updated: Date,
	result: {type: [Schema.Types.Mixed]}
});

module.exports = mongoose.model('Poll', PollSchema);
