/**
 * Created by oladapo on 23/03/2016.
 */
'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
    to: String,
    message: String,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sms', MessageSchema);