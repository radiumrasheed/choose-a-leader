'use strict';

var _ = require('lodash');
var State = require('./state.model');

// Get list of states
exports.index = function(req, res) {
  State.find(function (err, states) {
    if(err) { return handleError(res, err); }
    return res.json(200, states);
  });
};

// Get a single state
exports.show = function(req, res) {
  State.findById(req.params.id, function (err, state) {
    if(err) { return handleError(res, err); }
    if(!state) { return res.send(404); }
    return res.json(state);
  });
};

// Creates a new state in the DB.
exports.create = function(req, res) {
  State.create(req.body, function(err, state) {
    if(err) { return handleError(res, err); }
    return res.json(201, state);
  });
};

// Updates an existing state in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  State.findById(req.params.id, function (err, state) {
    if (err) { return handleError(res, err); }
    if(!state) { return res.send(404); }
    var updated = _.merge(state, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, state);
    });
  });
};

// Deletes a state from the DB.
exports.destroy = function(req, res) {
  State.findById(req.params.id, function (err, state) {
    if(err) { return handleError(res, err); }
    if(!state) { return res.send(404); }
    state.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}