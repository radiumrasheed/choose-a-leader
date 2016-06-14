/**
 * Created by DrCraig-PC on 25/05/2016.
 */
'use strict';
var Agenda = require('agenda');
var mailer = require('./components/tools/mailer');
var config = require('./config/environment');
var Member = require('./api/member/member.model');
var User = require('./api/auth/auth.model');
var Branch = require('./api/branch/branch.model');
var VotersReg = require('./api/votersReg/votersReg.model');

var agenda = new Agenda({db: { address: config.mongo.uri }});

agenda.define('Send Accreditation Link To All Members', function (job, done) {
    Member.find({setupLink_sent: true}).exec(function(err, allMembers) {
		if (err) { 
			job.fail(err); 
			job.save(); 
			done(); 
		}
		if (allMembers.length) {
			_(allMembers).forEach(function(invoice) {
				console.log(allMembers.email);
			});

			done();
		} else {
			done();
		}
	})
});

agenda.every('minute', 'Send Accreditation Link To All Members');

exports.start = function() { 
	agenda.start(); 
};
