'use strict';

var _ = require('lodash');
var Person = require('./person.model');
// var Member = require('./member.model');
// var  User = require('../auth/auth.model');
// var Branch = require('../branch/branch.model');

require('mongoose-pagination');

// Get list of members
/*exports.index = function(req, res) {
	var n_sn = new RegExp(req.query.name, 'i');

 var condition = req.query.verified === undefined ? {} : { verified: 1 };
	if (req.query.name) {
		condition["$or"] = [ { 'surname': { $regex: n_sn }},  { 'middleName': { $regex: n_sn }},  { 'othername': { $regex: n_sn }}, { 'firstName': { $regex: n_sn }} ];
	}

	Member.find(condition).paginate((req.query.page || 1), (req.query.perPage || 25), function (err, members, total) {
		res.header('total_found', total);
		return res.json(members);
	});
};
/!*
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
	Member.findById(req.query._member).populate('_user').exec( function (err, member) {
		if(err) { return handleError(res, err); }
		if(!member) { return res.send(404); }
		return res.json(member);
	});
};*!/*/

// Creates a new member in the DB.
exports.create = function(req, res) {
	Person.create(req.body, function(err, person) {
		if(err) { return handleError(res, err); }
		return res.json(201, person);
	});
};

/*
// Updates an existing member in the DB.
exports.update = function(req, res) {
	if(req.body._id) { delete req.body._id; }

	Member.findById(req.params.id, function (err, member) {
		if (err) { return handleError(res, err); }
		if(!member) { return res.send(404); }
		var updated = _.merge(member, req.body);
		updated.save(function (err) {
			if (err) { return handleError(res, err); }
			return res.json(200, member);
		});
	});
};

// Creates a new User in auths and updates its corresponding member in the database
exports.createUser = function(req, res) {

	var sendPassword = function (member, user) {
		mailer.sendDefaultPassword(req.body.phone, member.email, user.otp, member.sc_number, function () {
			return res.status(200).json({
				message: "Your password has been sent to the phone number and email address we have on file."
			}, user);
		});
	}

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

 else if (typeof member._user === "undefined" || member._user === null ) {
			var u = new User();
			u.otp = randomString();
			u.password = u.generateHash(u.otp);
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
								return res.json(200, u);
							}
						});
					});
				}
			});
		}

		/!*TODO := add check for setup-stage, if password is not changed go to step to step 2, if not confirmed, go to step 3 *!/
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
*/


function handleError(res, err) {
	return res.send(500, err);
};
