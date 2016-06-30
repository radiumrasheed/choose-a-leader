'use strict';

var _ = require('lodash');
var Enquiry = require('./enquiry.model');
var mailer = require('../../components/tools/mailer');


exports.create = function (req,res) {
  Enquiry.create(req.body, function(err, enquiry) {
    if(err) { return handleError(res, err); }
    mailer.sendEnquiryRecieved(enquiry.phone,enquiry.email);
    return res.json(201);
  });
};
