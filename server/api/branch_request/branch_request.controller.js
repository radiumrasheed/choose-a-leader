'use strict';

var _ = require('lodash');
var BranchRequest = require('./branch_request.model');
require('mongoose-pagination');

// Get list of branch_requests
exports.index = function(req, res) {
  var condition = req.query.resolved == undefined ? {} : {
    resolved: req.query.resolved
  };
  condition.deleted = false;

  BranchRequest.find(condition).populate('_member').paginate((req.query.page || 1), (req.query.perPage || 25), function (err, requests, total) {
    res.header('total_found', total);
    return res.json(requests);
  });
};

// Get a single branch_request
exports.show = function(req, res) {
  BranchRequest.findById(req.params.id, function (err, branch_request) {
    if(err) { return handleError(res, err); }
    if(!branch_request) { return res.send(404); }
    return res.json(branch_request);
  });
};

// Creates a new branch_request in the DB.
exports.create = function(req, res) {
  BranchRequest.create(req.body, function(err, branch_request) {
    if(err) { return handleError(res, err); }
    return res.json(201, branch_request);
  });
};

// Updates an existing branch_request in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  BranchRequest.findById(req.params.id, function (err, branch_request) {
    if (err) { return handleError(res, err); }
    if(!branch_request) { return res.send(404); }
    var updated = _.merge(branch_request, req.body);
    updated.updated = new Date();
    updated.updatedBy = req.user;
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, branch_request);
    });
  });
};

// Deletes a branch_request from the DB.
exports.destroy = function(req, res) {
  BranchRequest.findById(req.params.id, function (err, branch_request) {
    if(err) { return handleError(res, err); }
    if(!branch_request) { return res.send(404); }
    branch_request.deleted = true;
    branch_request.updated = new Date();
    branch_request.updatedBy = req.user;

    branch_request.save(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}