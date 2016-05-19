'use strict';

var _ = require('lodash');
var Position = require('./position.model');
var Poll = require('../poll/poll.model');
var User = require('../auth/auth.model');
var async = require('async');

function showPosition(id, res) {
  Position.findById(id).populate('candidates._member').exec(function (err, position) {
    if(err) { return handleError(res, err); }
    if(!position) { return res.send(404); }
    return res.json(position);
  });
}

function randString() {
  var possible = "ABCDEFGHJKLMNPQRSTUVWXY123456789";
  return possible.charAt(Math.floor(Math.random() * possible.length)) + possible.charAt(Math.floor(Math.random() * possible.length));
}

// Get list of positions
exports.index = function(req, res) {
  Position.find(req.query, '-candidates', function (err, positions) {
    if(err) { return handleError(res, err); }
    return res.json(200, positions);
  });
};

// Get list of positions and candidates
exports.ballot = function(req, res) {
  if (req.query._poll == undefined) return res.json([]);

  async.parallel([
      function (_cb) {
        Poll.findById(req.query._poll, function (e, poll) {
          return _cb(e, poll);
        });
      },
      function (_cb) {
        User.findById(req.user).populate('_member').exec(function (e, user) {
          return _cb(e, user);
        });
      }
  ], function (err, resp) {
    if (err) { return handleError(res, err); }
    // Validate qualifications of the Member
    var poll = resp[0],
        user = resp[1];

    var _usr = new String(user._member._branch);
    var _pol = new String(poll._branch);
    _usr = _usr.toLocaleLowerCase(_usr);
    _pol = _pol.toLocaleLowerCase(_pol);

    if (_usr.toString() === _pol.toString() || poll.national) {
      Position.find(req.query).select('-candidates.photo').populate('candidates._member').exec(function (err, positions) {
        if(err) { return handleError(res, err); }
        return res.json(200, positions);
      });
    } else {
      // User isn't Qualified to Vote in this Ballot
      return res.json([]);
    }
  });
};

exports.photo = function (req, res) {
  Position.findOne({
    'candidates._id': req.params.id
  }).exec(function (err, pos) {
    var candidate = _.find(pos.candidates, function (c) {
      return c._id == req.params.id;
    });

    var photo = candidate.photo;
    var start = photo.indexOf(';base64')+8;
    var type = photo.substring(5, photo.indexOf(";"));

    var img = new Buffer(photo.substring(start), 'base64');

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': img.length
    });
    return res.end(img);
  });
};

// Get a single position
exports.show = function(req, res) {
  return showPosition(req.params.id, res);
};

// Creates a new position in the DB.
exports.create = function(req, res) {

  Position.count({}, function (err, ct) {
    var pos = req.body;
    pos.code = (ct+1) + pos.name.substring(0,1).toUpperCase()+"-";
    pos.code += randString();

    Position.create(req.body, function(err, position) {
      if(err) { return handleError(res, err); }
      return res.json(201, position);
    });
  });
};

// Updates an existing position in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Position.findById(req.params.id, function (err, position) {
    if (err) { return handleError(res, err); }
    if(!position) { return res.send(404); }
    var updated = _.merge(position, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, position);
    });
  });
};

// Add a Candidate to the List of Candidates
exports.addCandidate = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  Position.findById(req.params.id, function (err, position) {
    if (err) { return handleError(res, err); }
    if(!position) { return res.send(404); }

    var exists = _.find(position.candidates, (function (c) {
      return c._member == req.body._member;
    }));

    if (exists!=null) { return showPosition(position._id, res); }

    var candidate = _.pick(req.body, ['_member','photo','bio', 'url', 'secure_url', 'public_id']);
    candidate.code = (position.candidates.length + 1) + "C-" + randString();

    position.candidates.push(candidate);
    position.save(function (err) {
      if (err) { return handleError(res, err); }
      return showPosition(position._id, res);
    });
  });
};

//Deletes a position's candidate fromthe DB.
exports.destroyCandidate = function(req, res) {
  Position.update({_id : req.params.id}
    , { $pull : { "candidates" : { _id : req.params.candidate_id } } }, function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
  });
};

// Deletes a position from the DB.
exports.destroy = function(req, res) {
  Position.findById(req.params.id, function (err, position) {
    if(err) { return handleError(res, err); }
    if(!position) { return res.send(404); }
    position.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  console.log('Server error in Position Module', err);
  return res.send(500, err);
}
