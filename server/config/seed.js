/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/auth/auth.model');
var Member = require('../api/member/member.model');
var Setting = require('../api/setting/setting.model');
var faker = require('faker'),
    _ = require('lodash');

User.count({}, function(e, count) {
    if (count < 1) {
        // Create Default Admin User
        var user = new User();
        user.name = 'OMONAYAJO OLADAPO ADEOLA';
        user.email = 'o.omonayajo@gmail.com';
        user.password = user.generateHash('secret_key');
        user.role = 'admin';
        user.username = 'omonayajo';

        user.save();
    } else {
        console.log("Found ", count , " User accounts");
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
        for (var i=0; i<10; i++) {
            var dataToSave = {
                firstName: faker.name.firstName(),
                middleName: faker.name.firstName(),
                surname: faker.name.lastName(),
                dateOfBirth: faker.date.past(),
                gender: i%3==0?"Female":"Male",
                address: faker.address.streetAddress()+" "+faker.address.secondaryAddress()+", "+faker.address.county(),
                phoneNumber: "",
                nbaNumber: faker.address.zipCode()+""+faker.address.zipCode(),
                scNumber: "SC-"+faker.address.zipCode(),
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
                        _.each(members, function(member) {
                            var u = new User();
                            u.username = member.surname + member.firstName.substring(0,1) + member.middleName.substring(0,1);
                            u.password = u.generateHash(u.username);
                            u.role = "member";
                            u._member = member._id;

                            u.save(function (err) {
                                if (err) { console.log("Error saving User record", err); }
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