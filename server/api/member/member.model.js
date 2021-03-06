'use strict';

var mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

var MemberSchema = new Schema({
  title: String,
  firstName: String,
  middleName: String,
  surname: String,
  othername: String,
  dateOfBirth: Date,
  date_of_birth: String,
  gender: String,
  address: String,
  state_of_origin: String,
  // phoneNumber: Number,
  phone: String,
  // nbaNumber: String,
  // scNumber: String,
  sc_number: String,
  email: String,
  year_called: Number,
  accessCode: String,
  codeConfirmed: Boolean,
  branch: String,
  verified: Number,
  setupLink_sent: {type:Boolean, default:false},
  accredited: Boolean,
  _branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
  _user: { type: Schema.Types.ObjectId, ref: 'Auth' },
  lastModified: { type: Date, default: Date.now },
  requestCode: String,
  createdBy: String,
  setup_id: String,
  validity:Boolean,
  resent:Boolean,
  THresent:Boolean
});

// generating a hash
MemberSchema.methods.generateHash = function(id) {
  return bcrypt.hashSync(id, bcrypt.genSaltSync(8), null);
};

module.exports = mongoose.model('Member', MemberSchema);
