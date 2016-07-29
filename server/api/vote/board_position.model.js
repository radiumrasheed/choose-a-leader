/**
 * Created by radiumrasheed on 7/29/16.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BoardPositionSchema = new Schema({
    name: String,
    votes: { type: Number, default: 0 },
    _position: [{ type: Schema.Types.ObjectId, ref: 'Position' }],
    _poll: [{ type: Schema.Types.ObjectId, ref: 'Poll' }]
});

module.exports = mongoose.model('BoardPosition', BoardPositionSchema, 'BoardPosition');