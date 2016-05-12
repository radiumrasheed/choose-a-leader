'use strict';

var _ = require('lodash');
var Branch = require('./branch.model');
var Member = require('../member/member.model');
require('mongoose-pagination');

// Get list of branches
exports.index = function (req, res) {
    var condition = {};
    if (req.query.name) {
        var nameRegEx = new RegExp(req.query.name, 'i');
        condition = {'name': {$regex: nameRegEx}};
    }
    Branch.find(condition).sort({name: 1}).paginate((req.query.page || 1), (req.query.perPage || 25), function (err, branches, total) {
        if (err) {
            return handleError(res, err);
        }

        res.header('total_found', total);
        return res.json(branches);
    });
};

// Get a single branch
exports.show = function (req, res) {
    Branch.findById(req.params.id, function (err, branch) {
        if (err) {
            return handleError(res, err);
        }
        if (!branch) {
            return res.send(404);
        }
        return res.json(branch);
    });
};



// Creates a new branch in the DB.
exports.create = function (req, res) {
    Branch.create(req.body, function (err, branch) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, branch);
    });
};

exports.merge = function (req, res) {
    Branch.remove({_id: {$in: req.body.ids}}, function (err) {
        if (err) {
            return handleError(res, err);
        }
        Branch.create({name: req.body.name, state: ""}, function (err, branch) {
            Member.update({_branch: {$in: req.body.ids}}, {$set: {_branch: branch._id}}, {multi: true}, function (err) {
                if (err) return handleError(res, err);
                return res.json(branch);
            });
        });
    });
};

// Updates an existing branch in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Branch.findById(req.params.id, function (err, branch) {
        if (err) {
            return handleError(res, err);
        }
        if (!branch) {
            return res.send(404);
        }
        var updated = _.merge(branch, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, branch);
        });
    });
};

// Deletes a branch from the DB.
exports.destroy = function (req, res) {
    Branch.findById(req.params.id, function (err, branch) {
        if (err) {
            return handleError(res, err);
        }
        if (!branch) {
            return res.send(404);
        }
        branch.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

function handleError(res, err) {
    return res.send(500, err);
}
