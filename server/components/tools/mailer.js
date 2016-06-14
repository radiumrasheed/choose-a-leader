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
  "from": 'nbapolls-2016@nba-agc.org',
  "fromname": 'NBA Elections 2016',
  "to": [],
  'replyto' : 'nbapolls-2016@nigerianbar.org.ng'

};

var sendMessage = function(message, callback) {
  sendgrid.send(message, function(err, json) {
	if (err) { return console.error(err); }
	return callback(json);
  });
};

exports.sendDefaultPassword = function(phone, email, password, sc_number, next) {
  var __message = 'Your username is: ' + sc_number + ' and your default password is: '+ password + '. Please change' +
    ' it to get your Verification Code.';
	var _message = 'WELCOME TO THE NBA ELECTION PORTAL <br> <br> Your username is: <b>' + sc_number + '</b> <br> Your default password is: <b>'+ password + '</b>. <br> <br> Please change it to get your Verification Code.';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

      var url = 'http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE;

      request(url, function(err, res, body) {
		if (err) { return console.error(err); }
		Sms.create({ to: phone, message: __message });
		return cb(null, body);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'Your 2016 NBA Elector Password!';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
			return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID EMAIL - EMAIL NOT SENT');
      }
    }
  ], function (err, results) {
	if (err) { return console.error(err); }
	console.info("Key sent as SMS and Email ", results);
    return next();
  });
};

exports.sendPassword = function(phone, email, password, sc_number, next) {
  var __message = 'Your current password is: '+ password + '. You are advised to delete this message immediately and also change your password.';
	var _message = 'You have requested for you password <br> <br> Your password is: <b>'+ password + '</b>. <br> <br> You are advised to delete this mail immediately and also change your password.<br> <br> <br> <br> <small>If you did not request for your password, please contact our support team.</small>';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

  async.parallel([
    function (cb) {
      var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

      var url = 'http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE;

      console.log("SMS request URL: " + url);

      request(url, function(error, resp, body) {
		if (error) { return console.error(error); }
        Sms.create({ to: phone, message: __message });

        return cb(null, body);
      });
    },
    function (cb) {
      if (email!=undefined && email!=null) {
        var newMessage = message;
        newMessage.html = html_message;
        newMessage.subject = 'NBA 2016 Election Portal - Password Request';
        newMessage.to = [email];

        sendMessage(newMessage, function(res){
          return cb(null, res);
        });
      } else {
        return cb(null, 'INVALID LOGIN - EMAIL NOT SENT')
      }
    }
  ], function (err, results) {
    console.info("Key sent as SMS and Email ", results);
    return next();
  });
};

exports.sendVerificationSMS = function(phone, email, accessCode, next) {
  var __message = 'Your Verification Code is: '+ accessCode + '. PLEASE KEEP THIS SMS as You WILL NEED THIS CODE INCASE OF FURTHER VERIFICATION.';
	var _message = 'Your Verification Code is: <b>'+ accessCode + '</b>. PLEASE KEEP THIS MAIL as You WILL NEED THIS CODE INCASE OF FURTHER VERIFICATION.';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, res, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});

		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;

				newMessage.html = html_message;
				newMessage.subject = 'Your NBA Elector Verification Code';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("Verification Code sent as SMS and Email ", results);
		return next();
	});
};

exports.sendConfirmationSMS = function(phone, email, next) {
  var __message = 'Congratulations, Your NBA elector accreditation is complete. You can now login to the portal.';
	var _message = '<b>Congratulations</b>, Your NBA Elector Accreditation is complete. You can now login to the portal';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
  var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {
				if (error) { return console.log(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Congratulations! You are now eligible to vote.';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("confirmed accreditation sent as SMS and Email ", results);
		return next();
	});
};

exports.sendBallotReceiptSMS = function(phone, email, code, signature, next) {
  var __message = 'Your votes have been received. This is your Voting Signature: '+ signature + ' for this Poll. You can' +
    ' now check the status of your vote, please note that this is not related to Polls result.';
	var _message = 'Your votes have been received. This is your Voting Signature: <b>'+ signature + '</b> for this Poll. You can ' +
    'now check the status of your vote, please not that this is not related to Polls result';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Vote Successful Casted!';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID EMAIL - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("Ballot Receipt sent as SMS and Email ", results);
		return next();
	});
};

exports.sendSetupLink = function(phone, email, _id, name, next) {
	var link = 'https://election.nba-agc.org/setup/' + _id + '/';
	var __message = 'Welcome to NBA Election Portal, please visit the link below to begin accreditation .' + link;

	var _message = 'Dear ' + name + ', <br><br> Welcome to the NBA ELECTION PORTAL <br> <br> Please visit the link below to begin accreditation <br> <b> <a href="' + link + '"> <p>https://election.nba-agc.org/setup</p> </a> </b> <br>';

	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
	var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

		request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, res, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Welcome to NBA Election Portal.';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID LOGIN - EMAIL NOT SENT')
			}
		}
	], function (err, results) {
		console.info("accreditation link sent as SMS and Email ", results);
		return next();
	});
};

exports.sendDetailLink = function(phone, email, _id, name, next) {
	//TODO: replace with valid link
	var link = 'https://election.nba-agc.org/pre_setup/' + _id + '/';
	var __message = 'Welcome to NBA Election Portal, Kindly visit the link below to confirm your details in order to start the accreditation process. ' + link;
/*
	var __message = 'Sir, please find sample title: NBA-2016';
*/

	var _message = 'Dear ' + name + ', <br><br> Welcome to the NBA ELECTION PORTAL We are in the process of accrediting all eligible voters. Kindly click on the link below to confirm your details in order to start the accreditation process. <br> <b> <a href="' + link + '"> <p>https://election.nba-agc.org/pre_setup</p> </a> </b> <br> <br> Warm Regards, <br> <b>Ken Mozia, SAN </b> <br> (Chairman, NBA Elections 2016 Committee) <br> <b>Email: ken.mozia@nigerianbar.org.ng</b>';

	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="https://election.nba-agc.org"> <img src="https://election.nba-agc.org/assets/images/51bcebe4.logo.png"> </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: -12px auto 0;"> NBA <strong> e-Voting Portal </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"></td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + _message + ' </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"> <span style="color: #00CC39; font-weight:bold;">For enquiries,  </span> please call OTI EDAH on +2348033830679 or send emails to: nbapolls-2016@nigerianbar.org.ng</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
	var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

	async.parallel([
		function (cb) {
			var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

			request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+__message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {
				if (error) { return console.error(error); }
				Sms.create({ to: phone, message: __message });

				return cb(null, body);
			});
		},
		function (cb) {
			if (email!=undefined && email!=null) {
				var newMessage = message;
				newMessage.html = html_message;
				newMessage.subject = 'Welcome to NBA Election Portal';
				newMessage.to = [email];

				sendMessage(newMessage, function(res){
					return cb(null, res);
				});
			} else {
				return cb(null, 'INVALID LOGIN - EMAIL NOT SENT');
			}
		}
	], function (err, results) {
		console.info("detail request link sent as SMS and Email ", results);
		return next();
	});
};
