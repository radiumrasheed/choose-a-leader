'use strict';

var mongoose = require('mongoose');
var moment = require('moment');
var _ = require('lodash');
var Vote = require('./vote.model'),
    User = require('../auth/auth.model'),
    Position = require('../position/position.model'),
    Receipt = require('./ballot_receipt.model'),
    Member = require('../member/member.model'),
    Poll = require('../poll/poll.model'),
    BoardBranch = require('./board_branch.model'),
    BoardPosition = require('./board_position.model');

var async = require('async');
var mailer = require('../../components/tools/mailer');

var redis = require('redis'),
  config = require('../../config/environment'),
  redisClient = redis.createClient(config.redis.uri);

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
    { "$group": {
        "_id": {
          "_position": '$_position',
          "candidate": '$candidate'
        },
        "voteCount": { "$sum": 1 }
      } },
    { "$group": {
        "_id": "$_id._position",
        "votes": {
          "$push": {
            "candidate": "$_id.candidate",
            "count": "$voteCount"
          }
        },
        "total_count": { "$sum": "$voteCount" }
      } }
  ], function (err, data) {
    Member.populate(data, [{
      "path": "votes.candidate",
      "select": "surname firstName middleName othername sc_number"
    }, {
      "path": "_id",
      "options" : { "sort" : { 'index' : 1 } },
      "model": "Position",
      "select": "_id name code index"
    }], function (err, populated) {
      return res.json(populated);
    });
  });
};

//not yet used
exports.statsByMembers = function(req, res) {
  Vote.aggregate([
    { "$match": { "_poll" : mongoose.mongo.ObjectID(req.query._poll), "_position" : mongoose.mongo.ObjectID(req.query._position) } },
    { "$group": { "_id": { "_member": '$_member', "candidate": '$candidate'} } },
    { "$group": { "_id": "$_id.candidate", "votes": { "$push": { "member": "$_id._member"} } } }
  ], function (err, data) {
    Member.populate(data, [{
      "path": "_id",
      "select": "surname firstName middleName othername sc_number"
    },
      {
      "path": "votes.member",
      "model": "Auth",
      "select": "username"
    }], function (err, votesByMembers) {
      return res.json(votesByMembers);
    });
  });
};

//get list of votes according to branches
exports.statsByBranches = function (req, res) {
  Vote.aggregate([
    { "$match": { "_poll" : mongoose.mongo.ObjectID(req.query._poll), "_position" : mongoose.mongo.ObjectID(req.query._position) } },
    { "$group": { "_id": { "_branch": '$_branch', "candidate": '$candidate'}, "voteCount" : { "$sum" : 1 } } },
    { "$group": { "_id": "$_id.candidate", "votes": { "$push": { "branch": "$_id._branch", "count": "$voteCount" } }, "total_count" : { "$sum" : "$voteCount" } } }
  ], function (err, data) {
    Member.populate(data, [{
      "path": "_id",
      "select": "surname firstName middleName othername sc_number"
    },
      {
      "path": "votes.branch",
      "model": "Branch",
      "select": "_id name state"
    }], function (err, votesByBranches) {
      return res.json(votesByBranches);
    });

  });
};

// Get list of votes for a Position
exports.results = function(req, res) {
  if (req.role === 'admin') {
    Vote.find({ _position: req.params.id }, function (err, votes) {
      if(err) { return handleError(res, err); }
      return res.json(200, votes);
    });
  } else {
    res.status(403).json({message:'Unauthorized access.'});
  }
};

exports.receipt = function (req, res) {
  Receipt.find({
    // code: req.query.code,
    _member: req.user
  })
    .populate('_votes')
    .exec(function (err, data) {
      Vote.populate(data, [{
        "path": "_votes.candidate",
        "model": "Member"
        // "select": "surname firstName middleName othername sc_number"
      }, {
        "path": "_votes._position",
        "model": "Position"
        // "select": "surname firstName middleName othername sc_number"
      }, {
        "path": "_votes._poll",
        "model": "Poll"
        // "select": "_id name code description"
      }, {
        "path": "_votes._position.candidates._member",
        // "model": "Poll",
        // "select": "_id name code description"
      }], function (err, populated) {
        return res.json(populated);
      });
  });
};

exports.castVote = function (req, res) {
  const CACHE_KEY = "VOTED_"+req.user;
  
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
    },
    function (_cb) {
      Receipt.find({ _member:req.user }).exec(function (err,_receipt) {
        return _cb(err, _receipt);
      });
    }
  ], function (err, resp) {
    if (err) { return handleError(res, err); }
    // Validate qualifications of the Member
    var poll = resp[0],
      user = resp[1],
      recMember = resp[2];
    
    var _usr = new String(user._member._branch),
      _pol = new String(poll._branch);
    
    _usr = _usr.toLocaleLowerCase(_usr);
    _pol = _pol.toLocaleLowerCase(_pol);
    
    if(!user) { return res.status(400).json({message: "User not found!"}); }
    if (user._member.verified!=1) { return res.status(400).json({message: "You do not have authorization to vote here."}); }
    if (recMember.length > 0) {
      console.log("User with ID: ", req.user, " has voted before: ", recMember);
      return res.status(403).json({ message: "You have submitted your votes already" });
    }
    
    if (moment().isBefore(poll.closes)) {
      
      if (_usr.toString() === _pol.toString() || poll.national) {
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
              if (typeof req.body[k] === "object") {
                candidateSignature[k] = req.body[k].code;
                
                //console.log(req.body[k]);
                votes.push({
                  _branch: member._branch,
                  _position: k,
                  _member: req.user,
                  _poll: pollId,
                  candidate: req.body[k]._member._id,
                  voteDate: new Date(),
                  ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
                });
                
                BoardPosition.update({ _position: k, _poll : pollId },{ $inc: { votes : 1 } }, function (e) {
                  if (e) { console.log(e); }
                });
              }
            });
            
            BoardBranch.update({ _branch: member._branch, _poll: pollId },{ $inc: { votes : 1 } }, function (e) {
              if (e) { console.log(e); }
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
                    if (typeof(candidateSignature[s._id]) === 'undefined') {
                      candidateSignature[s._id] = '0';
                    }
                    signature += s.code + ":" + candidateSignature[s._id]+";";
                  });
                  
                  var receipt = {
                    _votes: voteIds,
                    _member: req.user,
                    _poll: pollId,
                    _realMember: user._member,
                    receiptDate: new Date(),
                    code: User.randomString(12),
                    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    signature: signature
                  };
                  
                  Receipt.create(receipt, function (err, receipt) {
                    
                    redisClient.set(CACHE_KEY, res.user, function () {
                      // Send Receipt Code to User
                      mailer.sendBallotReceiptSMS(member.phoneNumber || member.phone, member.email, receipt.code, receipt.signature, function () {
                        return res.json(receipt);
                      });
                    });
                  });
                });
              });
            });
          } else {
            return res.status(400).json({message: "You've not been accredited. Hence, you are not eligible to vote."});
          }
        });
      } else {
        return res.status(403).json({message: "You do not have authorization to vote here."});
      }
    } else {
      return res.status(403).json({message: "Poll has closed and voting has ended."});
    }
  });
  // function doDefault() {
  //   async.parallel([
  //     function (_cb) {
  //       Poll.findById(req.body._poll, function (e, poll) {
  //         return _cb(e, poll);
  //       });
  //     },
  //     function (_cb) {
  //       User.findById(req.user, '+password').populate('_member').exec(function (e, user) {
  //         return _cb(e, user);
  //       });
  //     },
  //     function (_cb) {
  //       Receipt.find({ _member:req.user }).exec(function (err,_receipt) {
  //         return _cb(err, _receipt);
  //       });
  //     }
  //   ], function (err, resp) {
  //     if (err) { return handleError(res, err); }
  //     // Validate qualifications of the Member
  //     var poll = resp[0],
  //       user = resp[1],
  //       recMember = resp[2];
  //
  //     var _usr = new String(user._member._branch),
  //       _pol = new String(poll._branch);
  //
  //     _usr = _usr.toLocaleLowerCase(_usr);
  //     _pol = _pol.toLocaleLowerCase(_pol);
  //
  //     if(!user) { return res.status(400).json({message: "User not found!"}); }
  //     if (user._member.verified!=1) { return res.status(400).json({message: "You do not have authorization to vote here."}); }
  //     if (recMember.length > 0) { return res.status(403).json({ message: "You have submitted your votes already" }); }
  //
  //     if (moment().isBefore(poll.closes)) {
  //
  //       if (_usr.toString() === _pol.toString() || poll.national) {
  //         // Verify Password
  //         user.validPassword(req.body.password, function(err, isMatch) {
  //           if (!isMatch) { return res.status(401).send({ message: 'Password Incorrect.' }); }
  //
  //           var member = user._member;
  //           if (member.codeConfirmed) {
  //             var pollId = req.body._poll;
  //
  //             // Build Vote Objects
  //             delete req.body.accessCode;
  //             delete req.body.password;
  //             delete req.body._poll;
  //
  //             var keys = _.keys(req.body),
  //               votes = [],
  //               candidateSignature = {};
  //
  //             _.each(keys, function (k) {
  //               if (typeof req.body[k] === "object") {
  //                 candidateSignature[k] = req.body[k].code;
  //
  //                 //console.log(req.body[k]);
  //                 votes.push({
  //                   _branch: member._branch,
  //                   _position: k,
  //                   _member: req.user,
  //                   _poll: pollId,
  //                   candidate: req.body[k]._member._id,
  //                   voteDate: new Date(),
  //                   ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  //                 });
  //
  //                 BoardPosition.update({ _position: k, _poll : pollId },{ $inc: { votes : 1 } });
  //               }
  //             });
  //
  //             BoardBranch.update({ _branch: member._branch, _poll: pollId },{ $inc: { votes : 1 } });
  //
  //             Vote.create(votes, function (err, docs) {
  //               if (err) { return handleError(res, err); }
  //
  //               Vote.find({
  //                 _member: req.user,
  //                 _position: { $in: keys }
  //               }, '_id', function (err, savedVotes) {
  //
  //                 var voteIds = _.pluck(savedVotes, '_id');
  //                 // Create a Receipt after Inserting the Votes
  //
  //                 Position.find({ _id: { $in: keys } }, function (err, signatures) {
  //                   var signature = "";
  //                   _.each(signatures, function (s) {
  //                     if (typeof(candidateSignature[s._id]) === 'undefined') {
  //                       candidateSignature[s._id] = '0';
  //                     }
  //                     signature += s.code + ":" + candidateSignature[s._id]+";";
  //                   });
  //
  //                   var receipt = {
  //                     _votes: voteIds,
  //                     _member: req.user,
  //                     _poll: pollId,
  //                     _realMember: user._member,
  //                     receiptDate: new Date(),
  //                     code: User.randomString(12),
  //                     ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  //                     signature: signature
  //                   };
  //
  //                   Receipt.create(receipt, function (err, receipt) {
  //
  //                     redisClient.set(CACHE_KEY, res.user);
  //
  //                     // Send Receipt Code to User
  //                     mailer.sendBallotReceiptSMS(member.phoneNumber || member.phone, member.email, receipt.code, receipt.signature, function () {
  //                       return res.json(receipt);
  //                     });
  //                   });
  //                 });
  //               });
  //             });
  //           } else {
  //             return res.status(400).json({message: "You've not been accredited. Hence, you are not eligible to vote."});
  //           }
  //         });
  //       } else {
  //         return res.status(403).json({message: "You do not have authorization to vote here."});
  //       }
  //     } else {
  //       return res.status(403).json({message: "Poll has closed and voting has ended."});
  //     }
  //   });
  // }
  //
  // redisClient.exists(CACHE_KEY, function (err, response) {
  //   if (err) { return doDefault(); }
  //   else {
  //     if (response == 1) {
  //       return res.status(403).json({ message: "You have submitted your votes already" });
  //     } else {
  //       return doDefault();
  //     }
  //   }
  // });
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

exports.lawyerStats = function (req, res) {
  Receipt.find({_poll: req.query.poll}, '-code -signature -receiptDate -smsSent -emailSent')
      .populate('_realMember')
      .sort('-receiptDate')
      .limit(5)
      .exec(function (err, Lawyers) {
        if (err) {
          return handleError(res, err);
        }
        return res.status(200).json(Lawyers);
      });
};

exports.branchStats = function (req, res) {
  BoardBranch.find({_poll: req.query.poll}, function (err, Branches) {
        if (err) {
          return handleError(res, err);
        }
        return res.status(200).json(Branches);
      });
};

exports.positionStats = function (req, res) {
  BoardPosition.find({_poll: req.query.poll}, function (err, Positions) {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(Positions);
  });
};

exports.boardStats = function (req, res) {
    Receipt.find({_poll: req.query.poll}, '-code -signature -receiptDate -smsSent -emailSent')
        .populate('_realMember')
        .sort('-receiptDate')
        .limit(10)
        .exec(function (err, Lawyers) {
            if (err) {
                return handleError(res, err);
            }
            BoardBranch.find({_poll: req.query.poll}, 'name votes accredited invalidated eligible').sort('name').exec( function (err, Branches) {
                if (err) {
                    return handleError(res, err);
                }
                BoardPosition.find({_poll: req.query.poll}, 'name votes').sort('index').exec( function (err, Positions) {
                    if (err) {
                        return handleError(res, err);
                    }
                    return res.status(200).json({positionStats : Positions, branchStats : Branches, lawyerStats : Lawyers});
                });
                // return res.status(200).json(Branches);
            });
            // return res.status(200).json(Lawyers);
        });
};

function handleError(res, err) {
  console.log('Vote Module Error', err);
  return res.send(500, err);
}
