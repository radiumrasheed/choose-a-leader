'use strict';

var _ = require('lodash');
var Registration = require('./registration.model'),
    request = require('request'),
    moment = require('moment');

var ObjectId = require('mongoose').Types.ObjectId;

// Get list of registrations
exports.index = function(req, res) {
  Registration.find(req.query).sort({lastModified: -1}).exec(function (err, registrations) {
    if(err) { return handleError(res, err); }
    return res.json(200, registrations);
  });
};

// Get a single registration
exports.show = function(req, res) {
  Registration.findById(req.params.id, function (err, registration) {
    if(err) { return handleError(res, err); }
    if(!registration) { return res.send(404); }
    return res.json(registration);
  });
};

exports.stats = function(req, res) {
    var d = new Date(),
        month = d.getMonth(),
        year = d.getFullYear(),
        day = d.getDate();

    Registration.aggregate([
        { $match: {
            _staff_: new ObjectId(req.user),
            lastModified: { $gt: new Date(year+','+month+','+day) }
        }},
        { $group: {
            _id: "$_staff_",
            amount: { $sum: "$conferenceFee" },
            count: {$sum:1}
        }}
    ], function(err, data){
        Registration.aggregate([
            { $match: {
                _staff_: new ObjectId(req.user)
            }},
            { $group: {
                _id: "$_staff_",
                amountAll: { $sum: "$conferenceFee" },
                countAll: {$sum:1}
            }}
        ], function(err, allData){
            return res.json(_.merge(data[0], allData[0]));
        });
    });
};

function handleError(res, err) {
    console.log(err);
  return res.send(500, err);
}