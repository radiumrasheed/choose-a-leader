'use strict';

var _ = require('lodash');
var VotersReg = require('./votersReg.model');

// Get list of branches
exports.index = function(req, res) {
  VotersReg.find().distinct('branchCode',function (err, branches) {
    if(err) { return handleError(res, err); }
    return res.json(200, branches);
  });
};


// Get list of branches with details
exports.details = function(req, res) {

  VotersReg.find({branchCode: req.body.branchCode}).sort('fullname').paginate((req.body.page || 1), (req.body.perPage || 25), function (err, members, total) {
    res.header('total_found', total);
    return res.json(members);
  });
};
// Get a single member
exports.getMe = function(req, res) {
  VotersReg.findById(req.query._id, function (err, member) {
    if(err) { return handleError(res, err); }
    if(!member) { return res.send(404); }
    return res.json(member);
  });
};

// // Creates a new state in the DB.
// exports.create = function(req, res) {
//   State.create(req.body, function(err, state) {
//     if(err) { return handleError(res, err); }
//     return res.json(201, state);
//   });
// };

// Updates an existing state in the DB.
exports.update = function(req, res) {
  VotersReg.findById(req.body._id, function (err, details) {
    if (err) { return handleError(res, err); }
    if(!details) { return res.send(404); }
    var updated = _.merge(details, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, details);

    });
  });
};


function handleError(res, err) {
  return res.send(500, err);
}
