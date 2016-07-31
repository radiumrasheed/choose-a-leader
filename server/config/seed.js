/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var mongoose = require('mongoose');


var User = require('../api/auth/auth.model');
var Member = require('../api/member/member.model');
var Setting = require('../api/setting/setting.model');
var faker = require('faker'),
    _ = require('lodash'),
    BoardBranch = require('../api/vote/board_branch.model'),
    BoardPosition = require('../api/vote/board_position.model'),
    Branch = require('../api/branch/branch.model'),
    Vote = require('../api/vote/vote.model'),
    Position = require('../api/position/position.model');

BoardPosition.remove({}, function () {
    console.log("Cleared BoardPosition collection");

    Position.find({}, function (e, positions) {
        _.each(positions, function (position) {
            Vote.count({_position: position._id}, function (e, voteCount) {

                // Count Votes for this Position
                var data = {
                    _position: position._id,
                    votes: voteCount,
                    name: position.name,
                    description: position.description,
                    _poll: position._poll,
                    index: position.index
                };

                var bp = new BoardPosition(data);
                bp.save();
            });
        });
    });
});

BoardBranch.remove({}, function () {
    console.log("Clear BoardBranch collection");
    Branch.find({}, function (e, branches) {
        _.each(branches, function (branch) {
            Vote.aggregate([{"$match": {"_branch": mongoose.mongo.ObjectID(branch._id)}}, {"$group": {"_id": {"_member": "$_member"}}}], function (err, data) {
                var data = {
                    _branch: branch._id,
                    votes: data.length,
                    name: branch.name,
                    _poll: mongoose.mongo.ObjectID('5788ca8a07111ac633075528')
                };
                // console.log(data['votes']);
                var bb = new BoardBranch(data);
                bb.save();
            });
        });
    });

});

User.count({}, function (e, count) {
    if (count < 1) {
        // Create Default Admin User
        var user = new User();
        user.name = 'OMONAYAJO OLADAPO ADEOLA';
        user.email = 'o.omonayajo@gmail.com';
        user.password = user.generateHash('secret_key');
        user.role = 'admin';
        user.username = 'omonayajo';

        user.save();
    }
});

Setting.count({}, function (e, ct) {
    if (ct == 0) {
        // Add Default Settings
        var s = new Setting();
        s.name = "poll_starts";
        s.label = "Polls Start";
        s.value = new Date('2015/01/13');
        s.type = 'date';

        s.save();

        var s1 = new Setting();
        s1.name = "poll_ends";
        s1.label = "Polls Close";
        s1.value = new Date('2015/01/20');
        s1.type = 'date';

        s1.save();
    }
});

Member.count({}, function (e, count) {
    if (count < 1) {
        for (var i = 0; i < 10; i++) {
            var dataToSave = {
                firstName: faker.name.firstName(),
                middleName: faker.name.firstName(),
                surname: faker.name.lastName(),
                dateOfBirth: faker.date.past(),
                gender: i % 3 == 0 ? "Female" : "Male",
                address: faker.address.streetAddress() + " " + faker.address.secondaryAddress() + ", " + faker.address.county(),
                phoneNumber: "",
                nbaNumber: faker.address.zipCode() + "" + faker.address.zipCode(),
                scNumber: "SC-" + faker.address.zipCode(),
                accessCode: ""
            };

            var m = new Member(dataToSave);
            m.save();
        }
    } else {
        // Check that Use accounts have been created
        User.count({}, function (err, ct) {
            if (ct == 1) {
                Member.find({}, function (err, members) {
                    if (!err && members.length) {
                        _.each(members, function (member) {
                            var u = new User();
                            u.username = member.surname + member.firstName.substring(0, 1) + member.middleName.substring(0, 1);
                            u.password = u.generateHash(u.username);
                            u.role = "member";
                            u._member = member._id;

                            u.save(function (err) {
                                if (err) {
                                    console.log("Error saving User record", err);
                                }
                                else {
                                    member._user = u._id;
                                    member.save();
                                }
                            });
                        });
                    }
                });
            }
        });
    }
});