'use strict';

var _ = require('lodash'),
    jwt = require('jwt-simple'),
    moment = require('moment');

var User = require('./auth.model'),
    Member = require('../member/member.model');

var mailer = require('../../components/tools/mailer');

function createJWT(user) {

    var payload = {
        sub: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        name: user.name,
        iat: moment().unix(),
        exp: moment().add(10, 'hours').unix()
    };
    return jwt.encode(payload, process.env.SESSION_SECRET);
}

function randomString() {
    var text = "";
    var possible = "ABCDEFGHJKLMNPQRSTUVWXY1234567890";

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function getUser(id, res) {
    User.findById(id).populate('_member').exec(function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        User.populate(user, {
            path: '_member._branch',
            model: 'Branch'
        }, function (err, doc) {
            return res.json(doc);
        });
    });
}

function getUserFromUsername(id, res) {
    User.findOne({"username": "id"}).populate('_member').exec(function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        User.populate(user, {
            path: '_member._branch',
            model: 'Branch'
        }, function (err, doc) {
            return res.json(doc);
        });
    })
}

// Get list of users
exports.index = function (req, res) {
    User.find(req.query, function (err, users) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, users);
    });
};

// Get a single registration
exports.show = function (req, res) {
    return getUser(req.params.id || req.user, res);
};

// Creates a new registration in the DB.
exports.create = function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(201, user);
    });
};

/**
 * Get password Reset Request
 *
 * @param req
 * @param res
 */
exports.getPasswordResetRequest = function (req, res) {
    var confirmRequest = function (member) {
        mailer.sendConfirmRequestCodeAsSMS(member.requestCode, member.phone, function () {
            return res.json({
                message: "Please provide the code sent to your phone."
            });
        });
    };

    var exp = new RegExp(req.body.sc_number, 'i');

    Member.findOne({sc_number: {$regex: exp}, accredited: true}, function (err, member) {
        if (err) {
            return handleError(res, err);
        }
        if (!member) {
            return res.status(400).json({message: "No record found or not yet accredited. "});
        }
        /*        if (member.phone.indexOf(req.body.phone) === -1) {
         return res.status(400).json({message: "Phone number you’ve entered is different from what we have on our verification register. Please contact your local branch."});
         */

        if (member.email !== req.body.email) {
            return res.status(400).json({message: "Please provide the email you registered with."});
        }

        var updatedMember = new Member();
        updatedMember = _.merge(updatedMember, member);

        updatedMember.requestCode = randomString();
        updatedMember.save(function (err) {
            if (err) {
                return handleError(res, err);
            }
            else {
                confirmRequest(updatedMember);
            }
        });

    });
};

// Updates an existing registration in the DB.
exports.update = function (req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    var member = req.body._member;
    req.body._member = member._id;

    if (typeof member._branch != "string") {
        delete member._branch;
    }

    User.findById(req.params.id, function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        var updated = _.merge(user, req.body);

        updated.save(function (err) {
            if (err) {
                return handleError(res, err);
            }

            // Update Member Info
            Member.findById(updated._member, function (err, _member) {
                if (err) {
                    return handleError(res, err);
                }
                if (!user) {
                    return res.send(404);
                }
                var updatedM = _.merge(_member, member);

                updatedM.lastModified = new Date();

                // Generate AccessCode (if empty)
                if (updatedM.accessCode === undefined || updatedM.accessCode === '') {
                    updatedM.accessCode = User.randomString(8);
                }

                updatedM.save(function (err) {
                    if (err) {
                        return handleError(res, err);
                    }
                    if (req.query.sendCode) {
                        var phone = extractPhoneNumber(updatedM.phone);

                        mailer.sendVerificationSMS(phone, updatedM.email, updatedM.accessCode, function () {
                            return getUser(req.params.id, res);
                        });
                    } else {
                        return getUser(req.params.id, res);
                    }
                });
            });
        });
    });
};

/*Get phone number*/
var extractPhoneNumber = function (phone_number) {
    var phone = phone_number.split(',')[0];
    phone = phone.split('/')[0];
    if (phone.indexOf('*') != -1) {
        phone = phone.split('*')[1];
    }
    return phone;
};

/**
 * Send Access Code to User via SMS
 *
 * @param req
 * @param res
 */
exports.sendCode = function (req, res) {
    User.findById(req.user).populate('_member').exec(function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }

        if (user._member.accessCode === undefined || user._member.accessCode === '' || user._member.accessCode === null) {
            return res.status(400).json({message: "Please setup account first."});
        }

        var phone = extractPhoneNumber(user._member.phone);

        mailer.sendVerificationSMS(phone, user._member.email, user._member.accessCode, function () {
            return res.send(200);
        });
    });
};

/**
 * Send Confirmation SMS
 *
 * @param req
 * @param res
 */
exports.confirm = function (req, res) {
    User.findById(req.body._id).populate('_member').exec(function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }

        Member.findById(user._member._id, function (err, member) {
            if (err) {
                return handleError(res, err);
            }
            if (!member) {
                return res.send(404);
            }
            var oldConf = member.codeConfirmed;
            if (oldConf) {
                return res.status(200).json({message: "Accreditation Code already Confirmed"});
            }

            if (member.accessCode === req.query.code) {
                member.codeConfirmed = true;
                member.save(function () {
                    var phone = extractPhoneNumber(member.phone);

                    mailer.sendConfirmationSMS(phone, member.email, function () {
                        return res.status(200).json({
                            message: "CONGRATULATIONS. You have been accredited!" +
                            " Confirmed"
                        });
                    });
                });
            }
        });
    });
};

// Deletes a registration from the DB.
exports.destroy = function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        user.remove(function (err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(204);
        });
    });
};

exports.confirmReset = function (req, res) {

    if (req.body.user === undefined || req.body.token === undefined) {
        return res.status(401).json({message: 'Invalid password reset request. Please go through the password recovery process again.'});
    }

    User.findOne({_id: req.body.member, resetToken: req.body.token}, function (err, theUser) {
        if (err) {
            handleError(res, err);
        }

        if (theUser) {

            if (moment().isBefore(theUser.tokenExpires)) {

                return res.status(200).json(theUser);

            } else {

                return res.status(401).json({message: 'Your password reset request has expired. Please make the request again.!'});
            }

        } else {
            return res.status(404).send({message: 'Invalid request!'});
        }
    });
};

exports.changePassword = function (req, res) {
    if (req.body._id === undefined) {
        return res.status(400).json({message: 'Invalid password reset request.'});
    }

    User.findById(req.body._id, '+password', function (err, theUser) {
        if (err) {
            handleError(res, err);
        }

        theUser.validPassword(req.body.current_password, function (err, isMatch) {
            if (isMatch) {

                theUser.password = theUser.generateHash(req.body.password);
                theUser.otp = null;
                theUser.changedPassword = true;
                theUser.lastModified = new Date();

                theUser.save(function (err) {

                    if (err !== null) {
                        return handleError(res, err);
                    }
                    if (req.query.sendCode) {
                        Member.findById(theUser._member, function (err, updatedM) {
                            var phone = extractPhoneNumber(updatedM.phone);

                            mailer.sendVerificationSMS(phone, updatedM.email, updatedM.accessCode, function () {
                            });
                            return res.status(200).json({message: "Password Changed Successfully!. Accreditation Code sent!"});
                        });
                    } else {
                        return res.status(200).json({message: "Password Changed Successfully!"});
                    }
                    // return res.status(200).json({message: "Password Changed Successfully!."});
                });

            }
            else {
                return res.status(404).send({message: 'Invalid Password'});
            }
        });
    });
};

exports.signUp = function (req, res) {

    User.findOne({email: req.body.email}, function (err, existingUser) {
        if (existingUser) {
            return res.status(409).send({message: 'An account with this email address already exists. It belongs to ' + existingUser.name});
        } else {

            var user = new User();

            user.email = req.body.email;
            user.name = req.body.name;
            user.role = req.body.role;
            user.password = user.generateHash(req.body.password);

            user.save(function () {
                delete user.password;

                res.send({token: createJWT(user)});

            });
        }
    });
};

exports.signIn = function (req, res) {
    var not_member = "{'$ne' : 'member'}";
    User.findOne({
        username: req.body.username.toLowerCase(),
        role: (req.body.admin ? ({'$ne': 'member'}) : 'member')
    }, '+password', function (err, user) {
        if (!user) {
            return res.status(401).send({message: 'Wrong username and/or password'});
        }

        user.validPassword(req.body.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({message: 'Wrong username and/or password.'});
            }
            res.header('changed_password', user.changedPassword);
            res.send({token: createJWT(user), role: user.role});

        });
    });
};

exports.sendResetLink = function (req, res) {
    var exp = new RegExp(req.body.sc_number, 'i');

    User.findOne({username: {$regex: exp}}, function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.status(400).json({message: "No record found or not yet accredited. "});
        }
        Member.findOne({sc_number: {$regex: exp}}, function (err, member) {


            if (err) {
                return handleError(res, err);
            }
            if (!member) {
                return res.status(400).json({message: "No record found or not yet accredited. "});
            }

            if (member.requestCode.toLowerCase() !== req.body.checkCode.toLowerCase()) {
                return res.status(400).json({message: "Invalid Code! ."});
            }
            else if (member.requestCode.toLowerCase() === req.body.checkCode.toLowerCase()) {

                var _token = randomString();


                user.tokenExpires = moment().add(3, 'hours').format();
                user.resetToken = user.generateHash(_token);
                delete user.requestCode;

                var resetLink = 'https://election.nba-agc.org/reset_password/' + user.resetToken;

                user.save(function (err) {
                    if (err) {
                        return handleError(res, err);
                    }
                    else {

                        mailer.sendResetLinkToEmail(resetLink, req.body.email, function () {
                            return res.json({
                                message: "A link to reset your password has been sent to your email"
                            });
                        });
                    }
                });
            }

        });

    });
};

exports.resetPassword = function (req, res) {

    User.findOne({"resetToken": req.body.id}).populate('_member').exec(function (err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        User.populate(user, {
            path: '_member._branch',
            model: 'Branch'
        }, function (err, doc) {
            if (moment().isBefore(doc.tokenExpires)) {
                return res.json(doc);
            } else {
                return res.status(401).json({message: 'Your password reset request has expired. Please make the request again.!'});
            }
        });
    });
};

function handleError(res, err) {
    console.log('Auth Endpoint Error: ', err);
    return res.send(500, err);
}
