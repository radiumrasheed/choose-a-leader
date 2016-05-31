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

  VotersReg.find({branchCode: req.body.branchCode}).paginate((req.body.page || 1), (req.body.perPage || 25), function (err, members, total) {
    res.header('total_found', total);
    return res.json(members);
  });
};
// // Get a single state
// exports.show = function(req, res) {
//   State.findById(req.params.id, function (err, state) {
//     if(err) { return handleError(res, err); }
//     if(!state) { return res.send(404); }
//     return res.json(state);
//   });
// };

// // Creates a new state in the DB.
// exports.create = function(req, res) {
//   State.create(req.body, function(err, state) {
//     if(err) { return handleError(res, err); }
//     return res.json(201, state);
//   });
// };

// // Updates an existing state in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   State.findById(req.params.id, function (err, state) {
//     if (err) { return handleError(res, err); }
//     if(!state) { return res.send(404); }
//     var updated = _.merge(state, req.body);
//     updated.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.json(200, state);
//     });
//   });
// };


function handleError(res, err) {
  return res.send(500, err);
}
