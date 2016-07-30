'use strict';

var _ = require('lodash');
var VotersReg = require('./votersReg.model'),
    DelVotersReg = require('./delVotersReg.model'),
    mailer = require('../../components/tools/mailer'),
    async = require('async'),
    Branches = require('../branch/branch.model'),
    Lawyer = require('../member/Lawyer.model');

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
        members.sort();
        return res.json(members);
    }

    if(req.body.unconfirmedVoter){
      VotersReg.find({
        deleted:false,
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

          if(members[index].updated !== undefined){
            var updatedPhone = members[index].updatedPhone;
            var updatedEmail = members[index].updatedEmail;
            var uend = updatedEmail.indexOf('@');
            members[index].updatedPhone = updatedPhone.replace(updatedPhone.substring(0, 6), '*******');
            members[index].updatedEmail = updatedEmail.replace(updatedEmail.substring(0, uend), '*********');
          }

        }

        return sendData(total, members);
      });
    }

    if(req.body.confirmedVoter){
      VotersReg.find({
        branchCode: req.body.branchCode,
        fullname: firstName,
        deleted:false
      }).sort('fullname').paginate(pageNo, perPage, function (err, members, total) {
        var index, len;
        for (index = 0, len = members.length; index < len; ++index) {
          if (members[index].updated !== undefined )
          {
            members[index].updatedSurname = members[index].updatedSurname.toUpperCase();
            members[index].updatedFirstName = members[index].updatedFirstName.toUpperCase();
            if(members[index].updatedMiddleName !== undefined){members[index].updatedMiddleName = members[index].updatedMiddleName.toUpperCase();}
          }
        }
        return sendData(total, members);
      });
    }


};

// Get list of branches with details with hidden modified data
exports.details = function (req, res) {
    var pageNo = req.body.page || 1,
        perPage = req.body.perPage || 25;

    function sendData(total, members) {
        res.header('total_found', total);
        res.header('total_found', total);
        members.sort();
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

                phone = phone.replace('+',"");
                if(phone.startsWith('234')){
                  phone = phone.slice(3);
                }

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

                if (email != 'NOT AVAILABLE' && email != null) {
                    var end = email.indexOf('@');
                    members[index].email = email.replace(email.substring(0, end), '*********');
                }
                if (phone != 'INVALID MOBILE' && phone != null) {
                    members[index].mobileNumber = phone.replace(phone.substring(0, 6), '*******');
                }

              if (members[index].updated !== undefined )
              {
                members[index].updatedSurname = members[index].updatedSurname.toUpperCase();
                members[index].updatedFirstName = members[index].updatedFirstName.toUpperCase();
                if(members[index].updatedMiddleName !== undefined){members[index].updatedMiddleName = members[index].updatedMiddleName.toUpperCase();}

                var updatedPhone = members[index].updatedPhone;
                var updatedEmail = members[index].updatedEmail;
                var uend = updatedEmail.indexOf('@');
                members[index].updatedPhone = updatedPhone.replace(updatedPhone.substring(0, 6), '*******');

                members[index].updatedEmail = updatedEmail.replace(updatedEmail.substring(0, uend), '*********');
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

        if (req.body.emailIsMatch || req.body.phoneIsMatch) {

            if (req.body.phoneIsMatch == true && req.body.emailIsMatch == false) {
                mailer.sendUpdatedRecordsToPhone(req.body);
            }
            if (req.body.emailIsMatch == true && req.body.phoneIsMatch == false) {
              mailer.sendUpdatedRecordsToEmail(req.body);
            }
            if (req.body.emailIsMatch == true && req.body.phoneIsMatch == true) {
              mailer.sendUpdatedRecordsToBoth(req.body);
            }
        }
      else {
            mailer.sendUpdatedRecordsToBoth(req.body)
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
        updated.save(function (err, savedUpdated) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, savedUpdated);
        });
    });
};

//send text and email
// exports.send = function (req, res) {
//   VotersReg.find({successResponse:false, phoneIsMatch:true,emailIsMatch:false}).limit(200).exec(function (err, details) {
//     if (err) {
//       return handleError(res, err);
//     }
//     if (!details) {
//       return res.send(404);
//     }
//     async.forEachSeries(details, function (detail,callback) {
//       if (detail.emailIsMatch || detail.phoneIsMatch) {
//
//         if (detail.phoneIsMatch == true && detail.emailIsMatch == false) {
//           mailer.sendUpdatedRecordsToPhone(detail);
//         }
//
//       }
//       detail.successResponse = true;
//       detail.save(function (err, savedUpdated) {
//         if (err) {
//           return handleError(res, err);
//         }
//         callback();
//       });
//     },function(err){
//       if (err) return next(err);
//       res.send('Emails and Sms successfully sent to '+details.length+' people');
//       console.log('Emails and Sms successfully sent to %d people', details.length);
//     });
//
//   });
// };


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

    var condition = {};

    if (req.body.branchCode) {
        condition['branchCode'] = req.body.branchCode;
    }

    if (req.body.deleted == false) {
        condition["deleted"] = false;
    }

    if (req.body.updated == true) {
        condition["updated"] = true;
    }

    if (req.body.confirm == true) {
        condition["confirmed"] = true;
    }

  if (req.body.confirmed == false) {
    condition["confirmed"] = false;
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

exports.getConfirmed = function (req,res) {
  var pageNo = req.body.page || 1,
    perPage = req.body.perPage || 25;

  function sendData(total, members) {
    res.header('total_found', total);
    return res.json(members);
  }

  VotersReg.find({
    branchCode: req.body.branchCode,
    deleted: false
  }).sort('fullname').paginate(pageNo, perPage, function (err, members, total) {
    // Write to Cache
    if (err) {
      return handleError(res, err);
    }
    if (!members) {
      return res.send(404);
    }

    // var index, len;
    // for (index = 0, len = members.length; index < len; ++index)
    // {
    //     members[index].updatedFirstName = members[index].updatedFirstName.toUpperCase();
    //     members[index].updatedMiddleName = members[index].updatedMiddleName.toUpperCase();
    //     members[index].updatedSurname = members[index].updatedSurname.toUpperCase();
    // }

    return sendData(total, members);
    });
};

exports.getSpecific = function (req, res) {
  var pageNo = req.body.page || 1,
    perPage = req.body.perPage || 25;

  var condition = {
    validity:{$ne:false}
  };

  if (req.body.branchCode) {
    condition['branchCode'] = req.body.branchCode;
  }

  if (req.body.deleted == false) {
    condition["deleted"] = false;
  }

  if (req.body.updated == true) {
    condition["updated"] = true;
  }



  function sendData(total, members) {
    res.header('total_found', total);
    return res.json(members);
  }
  VotersReg.find(condition).select('updatedSurname updatedMiddleName updatedFirstName updatedEmail sc_number confirmed _id').sort('updatedSurname').paginate(pageNo, perPage, function (err, members, total) {

    async.forEachSeries(members, function (member, callback) {
      var updated = {};
      async.series([
        function (callback) {
          var scnumber = member.sc_number.toLowerCase().replace('scn','').replace('.','').replace(':','').replace('sc','').replace(',','').trim();
          scnumber = new RegExp(scnumber, 'i');
          Lawyer.findOne({scNumber:scnumber}).select('fullname scNumber -_id').exec(function (err,result) {
            updated =  _.merge(member, result);
            callback();
          })
      },
      function (callback) {
          member = updated;
        //console.log(member);
        callback();
      }],function (err) {
        if (err)
        {
          return next(err);
        }
        // console.log(members);
        callback();
      });

    },function () {
      return sendData(total, members);
    });

  });

};

exports.update2 = function (req, res) {
  VotersReg.findById(req.body._id, function (err, details) {
    if (err) {
      return handleError(res, err);
    }
    if (!details) {
      return res.send(404);
    }
    var updated = _.merge(details, req.body);
    updated.save(function (err, savedUpdated) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, savedUpdated);
    });
  });
};

function handleError(res, err) {
    return res.send(500, err);
}
