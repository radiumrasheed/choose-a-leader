/**
 * Created by oladapo on 1/10/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReceiptSchema = new Schema({
    code: String,
    signature: String,
    emailSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    ipAddress: String,
    _member: { type: Schema.Types.ObjectId, ref: 'Auth' },
    _votes: [{ type: Schema.Types.ObjectId, ref: 'Vote' }],
    _poll: [{ type: Schema.Types.ObjectId, ref: 'Poll' }],
    _realMember: { type: Schema.Types.ObjectId, ref: 'Member' },
    receiptDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Receipt', ReceiptSchema);