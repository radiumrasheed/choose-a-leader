/**
 * Created by radiumrasheed on 7/29/16.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BoardPositionSchema = new Schema({
    position: String,
    votes: { type: Number, default: 0 },
    _position: [{ type: Schema.Types.ObjectId, ref: 'Position' }]
});

module.exports = mongoose.model('BoardPosition', BoardPositionSchema);