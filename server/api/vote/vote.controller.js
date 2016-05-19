'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var _ = require('lodash');
var Vote = require('./vote.model'),
    User = require('../auth/auth.model'),
    Position = require('../position/position.model'),
    Receipt = require('./ballot_receipt.model'),
    Member = require('../member/member.model'),
    Poll = require('../poll/poll.model');

var async = require('async');
var mailer = require('../../components/tools/mailer');

// Get list of votes
exports.index = function(req, res) {
  Vote.find({ _member: req.user, _poll: req.query.pollId }, function (err, votes) {
    if(err) { return handleError(res, err); }
    return res.json(200, votes);
  });
};

exports.stats = function (req, res) {

  Vote.aggregate([
    { "$match": { "_poll" : mongoose.mongo.ObjectID(req.query._poll) } },
    {
      "$group": {
        "_id": {
          "_position": '$_position',
          "candidate": '$candidate'
        },
        "voteCount": { "$sum": 1 }
      }
    },
    {
      "$group": {
        "_id": "$_id._position",
        "votes": {
          "$push": {
            "candidate": "$_id.candidate",
            "count": "$voteCount"
          }
        },
        "count": { "$sum": "$voteCount" }
      }
    },
    { "$sort": { "count": -1 } }
  ], function (err, data) {
    Member.populate(data, [{
      "path": "votes.candidate",
      "select": "surname firstName middleName sc_number"
    }, {
      "path": "_id",
      "model": "Position",
      "select": "_id name code description"
    }], function (err, populated) {
      return res.json(populated);
    });
  });
};

exports.candidates = function (req, res) {
  Position.aggregate([
    { "$match": { "_poll" : mongoose.mongo.ObjectID(req.query._poll) } },
    {
      "$group": {
        "_id": '$_id',
        // "candidates._id": "$candidates._id"
      }
    },
    {
      "$group": {
        "_id": "$_id",
        "votes": {
          "$push": {
            "candidate": "$_id.candi",
          }
        },
      }
    },
    { "$sort": { "count": -1 } }
  ], function (err, data) {
    Member.populate(data, [{
      "path": "votes.candidate._member",
      "select": "surname firstName middleName sc_number"
    }, {
      "path": "_id",
      "model": "Position",
      "select": "_id name code description candidates"
    }, {
      "path" : "votes.candidate._id",
      "model" : "Position",
      "select" : "_member _id code"
    }], function (err, populated) {
      return res.json(data);
    });
  });
};

// Get list of votes for a Position
exports.results = function(req, res) {
  if (req.role=='admin') {
    Vote.find({ _position: req.params.id }, function (err, votes) {
      if(err) { return handleError(res, err); }
      return res.json(200, votes);
    });
  } else {
    res.status(403).json({message:'Unauthorized access.'});
  }
};

exports.receipt = function (req, res) {
  Receipt.findOne({
    code: req.query.code,
    _member: req.user
  }, function (err, receipt) {

    Vote.find({
      _id: { $in: receipt._votes },
      _member: req.user
    }).populate('candidate _position _poll').exec(function (err, votes) {
      return res.json(votes);
    });
  });
};

exports.castVote = function (req, res) {
  async.parallel([
    function (_cb) {
      Poll.findById(req.body._poll, function (e, poll) {
        return _cb(e, poll);
      });
    },
    function (_cb) {
      User.findById(req.user, '+password').populate('_member').exec(function (e, user) {
        return _cb(e, user);
      });
    }
  ], function (err, resp) {
    if (err) { return handleError(res, err); }
    // Validate qualifications of the Member
    var poll = resp[0],
        user = resp[1];

    if(!user) { return res.status(400).json({message: "User not found!"}); }
    if (user._member.verified!=1) { return res.status(400).json({message: "You do not have authorization to vote here."}); }

    if (user._member._branch == poll._branch || !poll.national) {
      // Verify Password
      user.validPassword(req.body.password, function(err, isMatch) {
        if (!isMatch) { return res.status(401).send({ message: 'Password Incorrect.' }); }

        var member = user._member;
        if (member.codeConfirmed) {
          var pollId = req.body._poll;

          // Build Vote Objects
          delete req.body.accessCode;
          delete req.body.password;
          delete req.body._poll;

          var keys = _.keys(req.body),
              votes = [],
              candidateSignature = {};

          _.each(keys, function (k) {
            if (typeof(req.body[k]) == "object") {
              candidateSignature[k] = req.body[k].code;

              votes.push({
                _position: k,
                _member: req.user,
                _poll: pollId,
                candidate: req.body[k]._member._id,
                voteDate: new Date(),
                ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
              });
            }
          });

          Vote.create(votes, function (err, docs) {
            if (err) { return handleError(res, err); }

            Vote.find({
              _member: req.user,
              _position: { $in: keys }
            }, '_id', function (err, savedVotes) {

              var voteIds = _.pluck(savedVotes, '_id');
              // Create a Receipt after Inserting the Votes

              Position.find({ _id: { $in: keys } }, function (err, signatures) {
                var signature = "";
                _.each(signatures, function (s) {
                  signature += s.code + ":" + candidateSignature[s._id]+";";
                });

                var receipt = {
                  _votes: voteIds,
                  _member: req.user,
                  _poll: pollId,
                  receiptDate: new Date(),
                  code: User.randomString(12),
                  ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                  signature: signature
                };

                Receipt.create(receipt, function (err, receipt) {
                  // Send Receipt Code to User
                  mailer.sendBallotReceiptSMS(member.phoneNumber || member.phone, receipt.code, receipt.signature, function () {
                    return res.json(receipt);
                  });
                });
              });
            });
          });
        }
        else {
          return res.status(400).json({message: "You've not been accredited. Hence, you are not eligible to vote."});
        }
      });
    } else {
      return res.status(403).json({message: "You do not have authorization to vote here."});
    }
  });
};

// Get a single vote
exports.show = function(req, res) {
  Vote.findById(req.params.id, function (err, vote) {
    if(err) { return handleError(res, err); }
    if(!vote) { return res.send(404); }
    return res.json(vote);
  });
};

// Creates a new vote in the DB.
exports.create = function(req, res) {
  Vote.create(req.body, function(err, vote) {
    if(err) { return handleError(res, err); }
    return res.json(201, vote);
  });
};

// Updates an existing vote in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Vote.findById(req.params.id, function (err, vote) {
    if (err) { return handleError(res, err); }
    if(!vote) { return res.send(404); }
    var updated = _.merge(vote, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, vote);
    });
  });
};

// Deletes a vote from the DB.
exports.destroy = function(req, res) {
  Vote.findById(req.params.id, function (err, vote) {
    if(err) { return handleError(res, err); }
    if(!vote) { return res.send(404); }
    vote.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  console.log('Vote Module Error', err);
  return res.send(500, err);
}