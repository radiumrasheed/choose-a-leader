'use strict';

var _ = require('lodash');
var VotersReg = require('./votersReg.model'),
  Branches = require('../branch/branch.model');

// Get list of branches
exports.index = function(req, res) {
  Branches.find().distinct('name',function (err, branches) {
    if(err) { return handleError(res, err); }
    branches.sort();
    return res.json(200, branches);
  });
};

exports.getCount = function(req, res) {
  VotersReg.count({confirmed:false, updated:true},function (err, count) {
    if(err) { return handleError(res, err); }
    return res.json(200,{count:count});
  });
};

//search for people in a branch
exports.searchDetails = function(req, res) {
  var search = req.body.search;
  var arr = search.split(' ');

  var firstName = new RegExp(arr[0] + '+', 'i');

  VotersReg.find({ branchCode:req.body.branchCode , fullname: firstName}).sort('fullname').paginate((req.body.page || 1), (req.body.perPage || 25), function (err, members, total) {
    var index, len;
    for (index = 0, len = members.length; index < len; ++index) {
      var email = members[index].email;
      var phone = members[index].mobileNumber;
      if(email!='NOT AVAILABLE') {
        var end = email.indexOf('@');
        members[index].email = email.replace(email.substring(0, end), '*********');
      }
      if(phone!='INVALID MOBILE'){
        members[index].mobileNumber = phone.replace(phone.substring(0, 6), '*******');
      }
    }
    res.header('total_found', total);
    return res.json(members);
  });
};
// Get list of branches with details
exports.details = function(req, res) {
    if (req.body.confirm){
    VotersReg.find({branchCode: req.body.branchCode,confirmed:false, updated:true}).sort('fullname').paginate((req.body.page || 1), (req.body.perPage || 25), function (err, members, total) {
      res.header('total_found', total);
      return res.json(members);
    });
  }
  else {
    VotersReg.find({branchCode: req.body.branchCode}).sort('fullname').paginate((req.body.page || 1), (req.body.perPage || 25), function (err, members, total) {
      var index, len;
      for (index = 0, len = members.length; index < len; ++index) {
        var email = members[index].email;
        var phone = members[index].mobileNumber;
        if(email!='NOT AVAILABLE') {
          var end = email.indexOf('@');
          members[index].email = email.replace(email.substring(0, end), '*********');
        }
        if(phone!='INVALID MOBILE'){
          members[index].mobileNumber = phone.replace(phone.substring(0, 6), '*******');
        }
      }
      res.header('total_found', total);
      return res.json(members);
    });
  }

};
// Get a single member
exports.getMe = function(req, res) {
  VotersReg.findById(req.query._id, function (err, member) {
    if(err) { return handleError(res, err); }
    if(!member) { return res.send(404); }
    return res.json(member);
  });
};

// // Creates a new state in the DB.
// exports.create = function(req, res) {
//   State.create(req.body, function(err, state) {
//     if(err) { return handleError(res, err); }
//     return res.json(201, state);
//   });
// };

// Updates an existing state in the DB.
exports.update = function(req, res) {
  VotersReg.findById(req.body._id, function (err, details) {
    if (err) { return handleError(res, err); }
    if(!details) { return res.send(404); }
    var updated = _.merge(details, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, details);

    });
  });
};


function handleError(res, err) {
  return res.send(500, err);
}
