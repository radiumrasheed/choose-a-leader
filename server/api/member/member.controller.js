'use strict';

var _ = require('lodash');
var async = require('async');

var Member = require('./member.model');
var Lawyer = require('./Lawyer.model');
var User = require('../auth/auth.model');
var Branch = require('../branch/branch.model');
var mailer = require('../../components/tools/mailer');
var moment = require('moment');
require('mongoose-pagination');

/*var redis = require('redis'),
 config = require('../../config/environment'),
 redisClient = redis.createClient(config.redis.uri);*/

function randomString() {
    var text = "";
    var possible = "ABCDEFGHJKLMNPQRSTUVWXY123456789";

    for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

exports.getMember = function (req, res) {
    // var key = ["member-detail", req.body.updatedSurname, req.body.updatedFirstName].join('-');

    function doDefault() {
        var surname = new RegExp(req.body.updatedSurname + '*', 'i');
        var firstname = new RegExp(req.body.updatedFirstName + '*', 'i');
        Lawyer.find().and([{'fullname': surname}, {'fullname': firstname}]).exec(function (err, members) {
            if (err) return handleError(res, err);
            // redisClient.set(key, JSON.stringify(members));
            // redisClient.expire(key, 120);

            return res.status(200).json(members);
        });
    }

    doDefault();
    // redisClient.exists(key, function (e, v) {
    //   if (v == 1) {
    //     redisClient.get(key, function (err, val) {
    //       if (err) { return doDefault(); }
    //       return res.json(JSON.parse(val));
    //     });
    //   } else { return doDefault(); }
    // });
};

// Get list of members
exports.index = function (req, res) {
    var n_sn = new RegExp(req.query.name, 'i');

    var condition = req.query.verified === undefined ? {} : {verified: 1};
    if (req.query.name) {
        condition["$or"] = [{'surname': {$regex: n_sn}}, {'middleName': {$regex: n_sn}}, {'othername': {$regex: n_sn}}, {'firstName': {$regex: n_sn}}];
    }
    if (req.query._branch) {
        condition["$and"] = [{'_branch': req.query._branch}];
    }
    if (req.query.branchCode) {
        condition['branch'] = req.query.branchCode;
    }
    if (req.query.unaccredited) {
        condition['setupLink_sent'] = true;
        condition['_user'] = {$exists : false};
    }
    Member.find(condition).paginate((req.query.page || 1), (req.query.perPage || 25), function (err, members, total) {
        res.header('total_found', total);
        return res.json(members);
    });
};

// Get a single member
exports.show = function (req, res) {
    Member.findById(req.params.id, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        return res.json(member);
    });
};

// Get a single member from the ID used only on SETUP ACCOUNT
exports.showMember = function (req, res) {
    if ( moment().isAfter("2016-07-30 22:59", "YYYY-MM-DD HH:mm") ) {
        return res.status(403).json({
            message: "Sorry, Accreditation has ended!"
        });
    }
    else {
        if (req.query._member) {
            Member.findOne({setup_id : req.query._member}).populate('_user').populate('_branch').exec(function (err, member) {
                if (err) {
                    return handleError(res, err);
                }
                if (!member) {
                    return res.send(404);
                }
                if (member.setupLink_sent !== true) {
                    return res.send(403);
                }
                if (typeof member._user === "undefined" || member._user === null) {
                    res.header('stage', 1);
                    return res.json(member);
                }
                else if (member._user.changedPassword !== true && member.accredited !== true) {
                    res.header('stage', 2);
                    return res.json(member);
                }
                else if (member._user.changedPassword === true && member.accredited !== true) {
                    res.header('stage', 3);
                    return res.json(member);
                }
                else if (member.accredited === true) {
                    res.header('stage', 4);
                    return res.send(200);
                }
                return res.status(200).json({message: "Please contact our support team"});
            });
        }
        else {
            return res.status(400).json({
                message: "Invalid Request"
            });
        }
    }



};

// Creates a new member in the DB.
exports.create = function (req, res) {
    var condition = {
        sc_number: req.body.sc_number
    };

    if (req.body.confirm) {
        condition.inHouse = {$ne: true}
    }
    Member.find(condition, function (err, found) {
        if (err) {
            return handleError(res, err);
        }

        if (found.length) {
            return res.json({message: 'Voter Confirmed Already, Or Seems Like This SCN Is Already Taken', statusCode: 304});
        }
        else {
            delete req.body.confirm;
            Member.create(req.body, function (err, member) {
                if (err) {
                    return handleError(res, err);
                }
                return res.json({data: member, statusCode: 200});
            });
        }
    });

};

// Updates an existing member in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    Member.findById(req.params.id, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        var updated = _.merge(member, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(member);
        });
    });
};

exports.resendPassword = function (req, res) {
    var sendPassword = function (member, user) {
        mailer.sendDefaultPassword(member.setup_id, member.phone, member.email, user.otp, member.sc_number, function () {
            return res.status(200).json({message: 'Username and Password Resent!'});
        });
    };

    Member.findById(req.query._member).populate('_user', '+otp').exec(function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        if (member._user.changedPassword !== true && member.accredited !== true) {
            sendPassword(member, member._user);
        }

    });
}

// Creates a new User in auths and updates its corresponding member in the database for SETUP only
exports.createUser = function (req, res) {

    if ( moment().isAfter("2016-07-30 22:59", "YYYY-MM-DD HH:mm") ) {
        return res.status(403).json({
            message: "Sorry, Accreditation has ended!"
        });
    }
    else {

        var sendPassword = function (member, user) {
            mailer.sendDefaultPassword(member.setup_id, member.phone, member.email, user.otp, member.sc_number, function () {
                return res.status(200).json(user);
            });
        };

        if (req.body._id) {
            delete req.body._id;
        } //delete the member_ID from the form
        if (req.body._user) {
            delete req.body._user;
        } //delete the me0mber.user_ID from the form

        Member.findById(req.query.id).populate('_user').exec(function (err, member) {
            if (err) {
                return handleError(res, err);
            }
            if (!member) {
                return res.status(404).json({message: "No record found for specified Enrollment Number."});
            }

            if (member.phone.indexOf(req.body.phone) === -1) {
                return res.status(400).json({
                    message: "Phone number you’ve entered is different from what we have on our verification register. Please contact your local branch."
                });
            }

            else if (typeof member._user === "undefined" || member._user === null) {
                var re = new RegExp(member.sc_number, 'i');
                User.findOne({username : re}, 'username', function (err, user) {
                    if (err) { return handleError(res, err); }
                    if (user) {
                        return res.status(409).json({message: 'Please contact our support team'});
                    }
                    if (!user) {
                        var u = new User();
                        u.otp = randomString();
                        u.password = u.generateHash(u.otp);
                        u._member = req.query.id;
                        u.role = "member";
                        u.username = req.body.sc_number;
                        u.save(function (err) {
                            if (err) {
                                return handleError(res, err);
                            }
                            else {
                                Branch.findOne({name: req.body.branch}, '_id', function (err, branch) {
                                    if (err) {
                                        User.findOneAndRemove({"_id": u._id}, function (err) {
                                            if (err) {
                                                return handleError(res, err);
                                            }
                                        });
                                        return handleError(res, err);
                                    }
                                    if (!branch) {
                                        User.findOneAndRemove({"_id": u._id}, function (err) {
                                            if (err) {
                                                return handleError(res, err);
                                            }
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
                                                if (err) {
                                                    return handleError(res, err);
                                                }
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
                });

            }

            /*TODO := add check for setup-stage, if password is not changed go to step to step 2, if not confirmed, go to step 3 */
            else if (member._user.changedPassword !== true && member.accredited !== true) {
                res.header('stage', 2);
                return res.status(200).json(member._user);
            }

            else if (member._user.changedPassword === true && member.accredited !== true) {
                res.header('stage', 3);
                return res.status(200).json(member._user);
            }

            else {
                return res.status(409).json({
                    message: "User is already registered"
                });
            }
        });
    }

};

//Gets a user and resends setup link as sms and mail
exports.resendLink = function (req, res) {
    var resendLink = function (member) {
        mailer.resendSetupLink(member.phone, member.email, member.setup_id, member.surname + ' ' + member.firstName, function () {
            return res.status(200).json(member);
        });
    };

    Member.findById(req.query.id, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        resendLink(member);
    });
};

//Gets a user and sends setup link as sms and mail
exports.createLink = function (req, res) {
    var sendLink = function (member) {
        mailer.sendSetupLink(member.phone, member.email, member._id, member.surname + ' ' + member.firstName, function () {
            return res.status(200).json(member);
        });
    };

    Member.findById(req.query.id, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        sendLink(member);
    });
};

//Gets a user and sends detail request link as sms and mail
exports.detailLink = function (req, res) {
    var sendDetailsLink = function (member) {
        mailer.sendDetailLink(member.phone, member.email, member._id, member.firstName + ' ' + member.surname, function () {
            return res.status(200).json(member);
        });
    };

    Member.findById(req.query.id, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        sendDetailsLink(member);
    });
};


exports.updateSurname = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    Member.findOne({email: req.body.email, sc_number: req.body.sc_number}, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        var updated = _.merge(member, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(member);
        });
    });
};

//Stats no Members
exports.stats = function (req, res) {
    Member.count({accredited : true}, function (err, accredited) {
        if (err) { handleError(res, err); }
        Member.count({_user : { $exists : true }}, function (err, started_accreditation) {
            if (err) { handleError(res, err); }
            Member.count( { validity: false }, function (err, invalidated) {
                if (err) { handleError(res, err); }
                Member.count( { setupLink_sent : true }, function (err, setupLink_sent) {
                    if (err) { return handleError(res, err); }
                    Member.count( { resent : true }, function (err, resent) {
                        if (err) { return handleError(res, err); }
                        Member.count( { THresent : true }, function (err, THresent) {
                          if (err) { return handleError(res, err); }
                          res.status(200).json({accredited : accredited, started_accreditation : started_accreditation, invalidated :invalidated, setupLink_sent : setupLink_sent, resent : resent, THresent:THresent});
                        });
                    });
                });
            });
        });
    });
};


exports.distinctBranch = function (req, res) {
    Branch.find().distinct('name', function (err, branches) {
        if (err) {
            return handleError(res, err);
        }

        branches.sort();

        return res.json(200, branches);
    });
};


exports.allAccredited = function (req, res) {
    var page = (req.query.page || 1) - 1,
        perPage = req.query.perPage || 100;

    Branch.count({}, function (e, total) {
        Branch.find({}, 'name')
            .sort({ 'name': 1 })
            .skip(page * perPage)
            .limit(perPage)
            .lean()
            .exec(function(e, branches) {
                var _tasks = [];

                _.each(branches, function(b) {

                    _tasks.push(function(_cb) {
                        Member.find({ branch: b.name, accredited : true }, 'surname firstName lastName')
                            .exec(function(err, branchMembers) {
                                return _cb(err, branchMembers);
                            });
                    });
                });

                // Run Tasks Concurrently
                async.parallel(_tasks, function(__err, __resp) {
                    var toReturn = branches;

                    _.each(__resp, function(branchMembers, index) {
                        toReturn[index].branchMembers = _.sortBy(branchMembers, function(b) { return b.surname.index; });
                    });

                    res.header('total_found', total);
                    return res.json(toReturn);
                });
            });
    });
};


function handleError(res, err) {
    return res.send(500, err);
}
