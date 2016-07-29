/**
 * Created by radiumrasheed on 7/29/16.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BoardBranchSchema = new Schema({
    branch: String,
    votes: { type: Number, default: 0 },
    accredited: Number,
    invalidated: Number,
    eligible: Number,
    _branch: [{ type: Schema.Types.ObjectId, ref: 'Branch' }]
});

module.exports = mongoose.model('BoardBranch', BoardBranchSchema);