'use strict';

var _ = require('lodash');
var VotersReg = require('./votersReg.model'),
    DelVotersReg = require('./delVotersReg.model'),
    mailer = require('../../components/tools/mailer'),
    async = require('async'),
    Branches = require('../branch/branch.model');

// var redis = require('redis'),
//     config = require('../../config/environment'),
//     redisClient = redis.createClient(config.redis.uri);

// Get list of branches
exports.index = function (req, res) {
    Branches.find().distinct('name', function (err, branches) {
        if (err) {
            return handleError(res, err);
        }

        branches.sort();
        branches.shift();

        return res.json(200, branches);
    });
};

exports.getCount = function (req, res) {
    VotersReg.count({confirmed: false, updated: true}, function (err, count) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, {count: count});
    });
};

exports.getUpdatedBranches = function (req, res) {
    VotersReg.find({updated: true, confirmed: false}).distinct('branchCode', function (err, branches) {
        return res.send(200, {
            data: branches,
            size: branches.length
        })
    });
};

//search for people in a branch
exports.searchDetails = function (req, res) {
    var search = req.body.search;
    var arr = search.split(' ');
    var pageNo = req.body.page || 1,
        perPage = req.body.perPage || 25;

    var firstName = new RegExp(arr[0] + '+', 'i');

    // var rKey = ["search-details", pageNo, perPage, search].join('-').replace(' ', '_');

    function sendData(total, members) {
        res.header('total_found', total);
        return res.json(members);
    }

    VotersReg.find({
        branchCode: req.body.branchCode,
        fullname: firstName
    }).sort('fullname').paginate(pageNo, perPage, function (err, members, total) {
        var index, len;
        for (index = 0, len = members.length; index < len; ++index) {
            var email = members[index].email;
            var phone = members[index].mobileNumber;
            if (email != 'NOT AVAILABLE') {
                var end = email.indexOf('@');
                members[index].email = email.replace(email.substring(0, end), '*********');
            }
            if (phone != 'INVALID MOBILE') {
                members[index].mobileNumber = phone.replace(phone.substring(0, 6), '*******');
            }
        }

        return sendData(total, members);
    });
};

// Get list of branches with details with hidden modified data
exports.details = function (req, res) {
    var pageNo = req.body.page || 1,
        perPage = req.body.perPage || 25;

    function sendData(total, members) {
        res.header('total_found', total);
        return res.json(members);
    }

    if (req.body.confirm) {
        VotersReg.find({
            branchCode: req.body.branchCode,
            confirmed: false,
            updated: true,
            deleted: false
        }).sort('fullname').paginate(pageNo, perPage, function (err, members, total) {
            // Write to Cache
            var index, len;
            for (index = 0, len = members.length; index < len; ++index) {
                var phone = members[index].updatedPhone;
                phone = phone.indexOf("+") == '+' ? phone.replace(phone.indexOf("+"), "") : phone;
                phone = phone.indexOf("234") == '234' ? phone.replace(phone.indexOf("234"), "0") : phone;
                phone = phone.indexOf("0") == 0 ? phone.replace(phone.indexOf("0"), "") : phone;
                members[index].updatedPhone = phone;
                if (members[index].updatedPhone == members[index].mobileNumber) {
                    members[index].phoneIsMatch = true;
                }
                else {
                    members[index].phoneIsMatch = false;
                }

                if (members[index].email.toLowerCase() == members[index].updatedEmail.toLowerCase()) {
                    members[index].emailIsMatch = true;
                }
                else {
                    members[index].emailIsMatch = false;
                }
            }
            return sendData(total, members);
        });
    } else {
        VotersReg.find({branchCode: req.body.branchCode, deleted:false}).sort('fullname').paginate(pageNo, perPage, function (err, members, total) {
            var index, len;
            for (index = 0, len = members.length; index < len; ++index) {
                var email = members[index].email;
                var phone = members[index].mobileNumber;
                if (email != 'NOT AVAILABLE') {
                    var end = email.indexOf('@');
                    members[index].email = email.replace(email.substring(0, end), '*********');
                }
                if (phone != 'INVALID MOBILE') {
                    members[index].mobileNumber = phone.replace(phone.substring(0, 6), '*******');
                }
            }

            return sendData(total, members);
        });
    }
};

// Get a single member
exports.getMe = function (req, res) {
    VotersReg.findById(req.query._id, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.send(404);
        }
        return res.json(member);
    });
};

/* Creates a new state in the DB.
 exports.create = function(req, res) {
 State.create(req.body, function(err, state) {
 if(err) { return handleError(res, err); }
 return res.json(201, state);
 });
 };*/

// Updates an existing member in the voters register document
exports.update = function (req, res) {
    VotersReg.findById(req.body._id, function (err, details) {
        if (err) {
            return handleError(res, err);
        }
        if (!details) {
            return res.send(404);
        }

        if (req.body.messageToEmail || req.body.messageToPhone || req.body.messageToBoth) {

            if (req.body.messageToPhone) {
                mailer.sendUpdatedRecordsToPhone(req.body.messageToPhone, req.body.updatedPhone);
            }
            if (req.body.messageToEmail) {
              mailer.sendUpdatedRecordsToPhone(req.body.messageToPhone, req.body.updatedPhone);
            }
            if (req.body.messageToBoth) {
              mailer.sendUpdatedRecordsToPhone(req.body.messageToPhone, req.body.updatedPhone);
            }
        }
        if (req.body.prevModifiedBy && req.body.prevModifiedDate) {
            //save previous data if data is being modified
            delete details.prevDataModified;
            req.body.prevDataModified = {
                'fullname': details.fullname,
                'branchCode': details.branchCode,
                'mobileNumber': details.mobileNumber,
                'email': details.email,
                'scNumber': details.scNumber
            };
        }
        var updated = _.merge(details, req.body);
        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, details);
        });
    });
};

// Creates a new member in the voters register DB.
exports.create = function (req, res) {
    req.body.fullname.toUpperCase();
    VotersReg.create(req.body, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, member);
    });
};

exports.branchMembers = function (req, res) {
    var pageNo = req.body.page || 1,
        perPage = req.body.perPage || 25;

    var condition = {
        branchCode: req.body.branchCode
    };

    if (req.body.deleted == false) {
        condition["deleted"] = false;
    }

    if (req.body.updated == true) {
        condition["updated"] = true;
    }

    if (req.body.confirm == true) {
        condition["confirmed"] = true;
    }

    if (req.body.search) {
        var search = req.body.search;
        var arr = search.split(' ');
        var searchName = new RegExp(arr[0] + '+', 'i');

        condition["fullname"] = searchName;
    }

    function sendData(total, members) {
        res.header('total_found', total);
        return res.json(members);
    }

    VotersReg.find(condition).sort('fullname').paginate(pageNo, perPage, function (err, members, total) {
        return sendData(total, members);
    });

};

exports.checkVotersName = function (req, res) {
    var surname = new RegExp(req.body.surname + '*', 'i');
    var firstname = new RegExp(req.body.firstName + '*', 'i');
    VotersReg.find().and([{'fullname': surname}, {'fullname': firstname}]).exec(
        function (err, similarMembers) {
            if (err) return handleError(res, err);
            return res.status(200).json(similarMembers);
        });
};

/*exports.removeVoters = function (req, res) {

    var index, len;
    for (index = 0, len = req.body.ids.length; index < len; ++index) {

        VotersReg.findOne({_id: req.body.ids[index]}, function (err, voter) {

            async.series([

                function (_cb) {
                    DelVotersReg.create(voter, function (e, deleted) {
                        console.log(voter);
                        // if (e) { return handleError(res, err); }
                        return _cb(null, deleted);
                    });
                },
                function (_cb) {
                    VotersReg.remove({_id: req.body.ids[index]}, function (e) {
                        // if (e) { return handleError(res, err); }
                        return _cb(null, 'deleted');
                    });
                }
            ], function (err, response) {
                if (err) { return console.error(err); }
                return console.info(response);
            });
        });
    };
};*/

exports.removeVoters = function(req, res) {
    var index, len;
    for (index = 0, len = req.body.ids.length; index < len; ++index) {
        VotersReg.findById(req.body.ids[index], function (err, details) {
            if (err) {
                return handleError(res, err);
            }
            if (!details) {
                return res.send(404);
            }
            details.deleted = true;
            details.save(function (err, savedDetails) {
                if (err) {
                    console.log('not flagged as deleted');
                }
                console.info('flagged as deleted');
            });
        });
    }
    return res.send(204);
};

function handleError(res, err) {
    return res.send(500, err);
}
