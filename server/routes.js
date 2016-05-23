/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // var Branch = require('./api/branch/branch.model');
  // var _ = require('lodash');
  // var mongoose = require('mongoose'),
  //     Schema = mongoose.Schema;
  //
  // var BranchSchema = new Schema({
  //   _id: String
  // });
  //
  // var Branches = mongoose.model('NormBranches', BranchSchema);
  //
  // Branches.find({}, function (err, branches) {
  //     _.each(branches, function(b) {
  //       Branch.create({name: b._id, state: ""});
  //     });
  // });

  // var Branch = require('./api/branch/branch.model');
  // var Member = require('./api/member/member.model');
  // var _ = require('lodash');
  //
  // Member.find({}, function (err, members) {
  //   console.info("Working on %s records", members.length);
  //
  //   _.each(members, function (m, $i) {
  //     if (m.branch!=null && m.branch!=undefined) {
  //       Branch.find({name: m.branch.toUpperCase}, function (e, b) {
  //         if (!e && b) {
  //           m._branch = b._id;
  //           m.save();
  //           console.info("Updated record: %s", $i);
  //         }
  //       });
  //     } else {
  //       console.log("Cannot update record: %s because branch is null or undefined: %s", $i, m.branch);
  //     }
  //   });
  // });


  // Insert routes below
  app.use('/api/branch_requests', require('./api/branch_request'));
  app.use('/api/polls', require('./api/poll'));
  app.use('/api/votes', require('./api/vote'));
  app.use('/api/positions', require('./api/position'));
  app.use('/api/settings', require('./api/setting'));
  app.use('/api/states', require('./api/state'));
  app.use('/api/branches', require('./api/branch'));
  app.use('/api/registrations', require('./api/registration'));
  app.use('/api/members', require('./api/member'));
  app.use('/auth', require('./api/auth'));
  app.use('/api/person', require('./api/person'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
