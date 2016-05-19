/**
 * Created by oladapo on 6/27/15.
 */
'use strict';

var mandrill = require('mandrill-api');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);

var request = require('request');
var moment = require('moment'),
  Sms = require('./sms.model'),
  async = require('async');

// var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);
var message = {
  "html": '',
  "subject": '',
  "from": 'elections@nba-agc.org',
  "fromname": 'NBA Elections 2016',
  "to": [],
  'replyto' : 'support@nba-agc.org'
/*  "headers": {
    "Reply-To": 'support@nba-agc.org'
  },
  "important": true,
  "track_opens": true,
  "track_clicks": true,
  "view_content_link": true,
  "tags": [
    'e-voting'
  ],
  "subaccount": 'nba-agc',
  "metadata": {
    "website": 'www.nba-agc.org'
  }*/
};

var sendMessage = function(message, callback) {
  sendgrid.send(message, function(result) {
    callback(result);
  });
};

exports.sendDefaultPassword = function(phone, email, password, sc_number, next) {
  var __message = 'Your username is: ' + sc_number + ' and your default password is: '+ password + '. Please change' +
    ' it to get your voting code.';

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

      var url = 'http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE;

      console.log("SMS request URL: " + url);

      request(url, function(error, resp, body) {

        Sms.create({ to: phone, message: __message });

        return cb(null);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = __message;
        newMessage.subject = 'Your NBA Elektor Password!';
        newMessage.to.push(email);

        sendMessage(newMessage, function(e){
          console.log(e);
          return cb(null);
        });
      } else {
        return cb(null)
      }
    }
  ], function (err, results) {
    console.log("Key sent as SMS and Email ", results);
    return next();
  });
};

exports.sendVerificationSMS = function(phone, email, accessCode, next) {
  var __message = 'Your voting code is: '+ accessCode + '. DO NOT DELETE THIS SMS as You WILL NEED THIS CODE TO CAST' +
    ' YOUR VOTE';

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {

				Sms.create({ to: phone, message: __message });

				return cb(null);
			});

		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = __message;
				newMessage.subject = 'Your NBA Elector Voting Code';
				newMessage.to.push(email);

				sendMessage(newMessage, function(e){
					console.log(e);
					return cb(null);
				});
			} else {
				return cb(null)
			}
		}
	], function (err, results) {
		console.log("Voting code sent as SMS and Email ", results);
		return next();
	});
};

exports.sendConfirmationSMS = function(phone, email, next) {
  var __message = 'Congratulations, Your NBA elector accreditation is complete. You can now login to the portal.';
  var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {

				Sms.create({ to: phone, message: __message });

				return cb(null);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = __message;
				newMessage.subject = 'Congratulations! You are now eligible to vote.';
				newMessage.to.push(email);

				sendMessage(newMessage, function(e){
					console.log(e);
					return cb(null);
				});
			} else {
				return cb(null)
			}
		}
	], function (err, results) {
		console.log("confirmed accreditation sent as SMS and Email ", results);
		return next();
	});
};

exports.sendBallotReceiptSMS = function(phone, email, code, signature, next) {
  var __message = 'Your votes have been received. This is your Receipt Code: '+ code + ' for this Poll. You can check how you voted' +
    ' with this. Your vote signature is: ' + signature;

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {

				Sms.create({ to: phone, message: __message });

				return cb(null);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = __message;
				newMessage.subject = 'Vote Successful Casted!';
				newMessage.to.push(email);

				sendMessage(newMessage, function(e){
					console.log(e);
					return cb(null);
				});
			} else {
				return cb(null)
			}
		}
	], function (err, results) {
		console.log("Ballot Receipt sent as SMS and Email ", results);
		return next();
	});





};
