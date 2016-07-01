'use strict';

var _ = require('lodash');
var Member = require('./member.model');
var Lawyer = require('./Lawyer.model');
var  User = require('../auth/auth.model');
var Branch = require('../branch/branch.model');
require('mongoose-pagination');
var mailer = require('../../components/tools/mailer');

var redis = require('redis'),
  config = require('../../config/environment'),
  redisClient = redis.createClient(config.redis.uri);

function randomString() {
  var text = "";
  var possible = "ABCDEFGHJKLMNPQRSTUVWXY123456789";

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

exports.getMember = function (req, res) {
  var key = ["member-detail", req.body.updatedSurname, req.body.updatedFirstName].join('-');

  function doDefault() {
    var surname = new RegExp(req.body.updatedSurname + '*', 'i');
    var firstname = new RegExp(req.body.updatedFirstName + '*', 'i');
    Lawyer.find().and([{'fullname': surname}, {'fullname': firstname}]).exec(function (err, members) {
      if (err) return handleError(res, err);
      redisClient.set(key, JSON.stringify(members));
      redisClient.expire(key, 120);

      return res.status(200).json(members);
    });
  }

  redisClient.exists(key, function (e, v) {
    if (v == 1) {
      redisClient.get(key, function (err, val) {
        if (err) { return doDefault(); }
        return res.json(JSON.parse(val));
      });
    } else { return doDefault(); }
  });
};

// Get list of members
exports.index = function(req, res) {
    var n_sn = new RegExp(req.query.name, 'i');

    var condition = req.query.verified === undefined ? {} : {verified: 1};
    if (req.query.name) {
        condition["$or"] = [ { 'surname': { $regex: n_sn }},  { 'middleName': { $regex: n_sn }},  { 'othername': { $regex: n_sn }}, { 'firstName': { $regex: n_sn }} ];
    }
	if (req.query._branch) {
		condition["$and"] = [ {'_branch' : req.query._branch} ];
	}

    Member.find(condition).paginate((req.query.page || 1), (req.query.perPage || 25), function (err, members, total) {
        res.header('total_found', total);
        return res.json(members);
    });
};

// Get a single member
exports.show = function(req, res) {
    Member.findById(req.params.id, function (err, member) {
        if(err) { return handleError(res, err); }
        if(!member) { return res.send(404); }
        return res.json(member);
    });
};

// Get a single member for setup
exports.showMember = function(req, res) {
  Member.findById(req.query._member).populate('_user _branch').exec( function (err, member) {
    if(err) { return handleError(res, err); }
    if(!member) { return res.send(404); }
    return res.json(member);
  });
};

// Creates a new member in the DB.
exports.create = function(req, res) {
    Member.create(req.body, function(err, member) {
        if(err) { return handleError(res, err); }
        return res.json(201, member);
    });
};

// Updates an existing member in the DB.
exports.update = function(req, res) {
    if(req.body._id) { delete req.body._id; }

    Member.findById(req.params.id, function (err, member) {
        if (err) { return handleError(res, err); }
        if(!member) { return res.send(404); }
        var updated = _.merge(member, req.body);
        updated.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(member);
        });
    });
};

// Creates a new User in auths and updates its corresponding member in the database
exports.createUser = function(req, res) {

  var sendPassword = function (member, user) {
    mailer.sendDefaultPassword(req.body.phone, member.email, user.clear_password, member.sc_number, function () {
      return res.status(200).json(user);
    });
  };

  if (req.body._id) { delete req.body._id; } //delete the member_ID from the form
  if (req.body._user) { delete req.body._user; } //delete the me0mber.user_ID from the form

  Member.findById(req.query.id).populate('_user').exec(function (err, member) {
    if (err) { return handleError(res, err); }
    if (!member) { return res.status(404).json({message: "No record found for specified Enrollment Number."}); }

      if (member.phone.indexOf(req.body.phone) === -1) {
      return res.status(400).json({
        message: "Phone number you’ve entered is different from what we have on our verification register. Please contact your local branch."
      });
    }

      else if (typeof member._user === "undefined" || member._user === null) {
      var u = new User();
      u.clear_password = randomString();
      u.password = u.generateHash(u.clear_password);
      u._member = req.query.id;
      u.role = "member";
      u.username = req.body.sc_number;
      u.save(function (err) {
        if (err) { return handleError(res, err); }
        else {
          Branch.findOne({name : req.body.branch}, '_id', function (err, branch) {
            if (err) {
              User.findOneAndRemove({"_id": u._id}, function (err) {
                if (err) { return handleError(res, err); }
              });
              return handleError(res, err);
            }
            if (!branch) {
              User.findOneAndRemove({"_id": u._id}, function (err) {
                if (err) { return handleError(res, err); }
              });
              return res.status(404).json({message: "No record found for specified branch!"});
            }
            member._branch = branch._id;
            member._user = u._id;
            member.accredited = true;
            member.title = req.body.title;
            member.lastModified = new Date();
              if (member.accessCode === undefined || member.accessCode === '') {
              member.accessCode = User.randomString(8);
            }
            member.save(function (err) {
              if (err) {
                User.findOneAndRemove({"_id": u._id}, function (err) {
                  if (err) { return handleError(res, err); }
                });
                return res.status(404).json({message: "Cannot register member"});
              }
              else {
                sendPassword(member, u);
              }
            });
          });
        }
      });
    }

/*TODO := add check for setup-stage, if password is not changed go to step to step 2, if not confirmed, go to step 3 */
      else if (member._user.changedPassword === false) {
		return res.status(404).json({message : "Please change your password"});
	}

    else {
		console.log(member._user);
		return res.status(409).json({
        message: "User is already registered"
      });
    }
  });
};

//Gets a user and sends setup link as sms and mail
exports.createLink = function(req, res) {
	var sendLink = function (member) {
		mailer.sendSetupLink(member.phone, member.email, member._id, member.surname + ' ' + member.firstName, function() {
			return res.status(200).json(member);
		});
	};

	Member.findById(req.query.id, function (err, member) {
		if (err) { return handleError(res, err); }
		if(!member) { return res.send(404); }
		sendLink(member);
	});
};

//Gets a user and sends detail request link as sms and mail
exports.detailLink = function(req, res) {
    var sendDetailsLink = function (member) {
        mailer.sendDetailLink(member.phone, member.email, member._id, member.firstName + ' ' + member.surname, function() {
            return res.status(200).json(member);
        });
    };

    Member.findById(req.query.id, function (err, member) {
        if (err) { return handleError(res, err); }
        if(!member) { return res.send(404); }
        sendDetailsLink(member);
    });
};


function handleError(res, err) {
    return res.send(500, err);
};
