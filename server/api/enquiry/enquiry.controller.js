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

exports.getResolved = function (req,res) {
  Enquiry.find({resolved:true}).sort('_id').exec( function(err, enquiries) {
    if(err) { return handleError(res, err); }
    return res.json(enquiries);
  });
};

exports.getUnresolved = function (req,res) {
  Enquiry.find({resolved:false}).sort('_id').exec( function(err, enquiries) {
    if(err) { return handleError(res, err); }
    return res.json(enquiries);
  });
};



exports.getOne = function (req,res) {
  Enquiry.findById(req.params.id, function(err, enquiries) {
    if(err) { return handleError(res, err); }
    return res.json(enquiries);
  });
};


function handleError(res, err) {
  return res.send(500, err);
}
