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

};

var sendMessage = function(message, callback) {
  sendgrid.send(message, function(result) {
    callback(result);
  });
};

exports.sendDefaultPassword = function(phone, email, password, sc_number, next) {
  var __message = 'Your username is: ' + sc_number + ' and your default password is: '+ password + '. Please change' +
    ' it to get your Verification Code.';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="http://elektor.herokuapp.cam"> <img src="https://elektor.herokuapp.com/assets/images/51bcebe4.logo.png" > </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: 10px auto 0;"> NBA <strong> e-Voting Platform </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + __message + ' </td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="30"></td> </tr> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#000000;padding-right:10px">For support and enquiries, please call any of the following - Ayodeji Oni - <b>0803 345 2825</b>; Oti Edah, <b>0806 590 1348</b>. </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td width="30%"><img style="max-width:100%" src="http://lawpavilionplus.com/img/logo.png"></td> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"><span style="color: #00CC39; font-weight:bold;">For Enquiries and Conference Information </span> Send emails to: support@nba-agc.org and registration@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

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
        newMessage.html = html_message;
        newMessage.subject = 'Your 2016 NBA Elector Password!';
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
  var __message = 'Your Verification Code is: '+ accessCode + '. PLEASE KEEP THIS SMS as You WILL NEED THIS CODE INCASE OF FURTHER VERIFICATION.';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="http://elektor.herokuapp.cam"> <img src="https://elektor.herokuapp.com/assets/images/51bcebe4.logo.png" > </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: 10px auto 0;"> NBA <strong> e-Voting Platform </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + __message + ' </td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="30"></td> </tr> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#000000;padding-right:10px">For support and enquiries, please call any of the following - Ayodeji Oni - <b>0803 345 2825</b>; Oti Edah, <b>0806 590 1348</b>. </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td width="30%"><img style="max-width:100%" src="http://lawpavilionplus.com/img/logo.png"></td> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"><span style="color: #00CC39; font-weight:bold;">For Enquiries and Conference Information </span> Send emails to: support@nba-agc.org and registration@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

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

				newMessage.html = html_message;
				newMessage.subject = 'Your NBA Elector Verification Code';
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
		console.log("Verification Code sent as SMS and Email ", results);
		return next();
	});
};

exports.sendConfirmationSMS = function(phone, email, next) {
  var __message = 'Congratulations, Your NBA elector accreditation is complete. You can now login to the portal.';
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="http://elektor.herokuapp.cam"> <img src="https://elektor.herokuapp.com/assets/images/51bcebe4.logo.png" > </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: 10px auto 0;"> NBA <strong> e-Voting Platform </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + __message + ' </td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="30"></td> </tr> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#000000;padding-right:10px">For support and enquiries, please call any of the following - Ayodeji Oni - <b>0803 345 2825</b>; Oti Edah, <b>0806 590 1348</b>. </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td width="30%"><img style="max-width:100%" src="http://lawpavilionplus.com/img/logo.png"></td> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"><span style="color: #00CC39; font-weight:bold;">For Enquiries and Conference Information </span> Send emails to: support@nba-agc.org and registration@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';
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
				newMessage.html = html_message;
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
	var html_message = '<div style="margin:0; padding:0; font-family:Segoe UI,Segoe UI,Arial,Sans-Serif;"> <div style="margin:0; padding:0;"> <div style="max-width:600px; margin: 10px auto 0; background-color: #004600;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px"> <tbody> <tr> <td colspan="3" height="15"></td> </tr> <tr> <td width="20"></td> <td style="text-align: center;"> <a href="http://elektor.herokuapp.cam"> <img src="https://elektor.herokuapp.com/assets/images/51bcebe4.logo.png" > </a> </td> <td colspan="3"> <h3 align="center" valign="top" style="line-height:41px;font-size: 28px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: #FFFFFF; text-align:center; margin: 10px auto 0;"> NBA <strong> e-Voting Platform </strong> </h3> </td> </tr> <tr> <td colspan="3" height="15"></td> </tr> </tbody> </table> </div> <div style="max-width:600px; margin:0 auto; border-left: 1px solid #CCC; border-right: 1px solid #CCC; border-bottom: 1px solid #CCC; padding-bottom: 20px;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="display:block; max-width:600px;"> <tbody> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:36px;font-size:23px;font-family:Segoe UI Light,Segoe UI,Arial,Sans-Serif;color: green;padding-right:15px;padding-left:0px"> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> <tr> <td colspan="3" height="20"></td> </tr> <tr> <td width="40"></td> <td align="left" valign="top"> <table width="520" border="0" cellspacing="0" cellpadding="0" style="display:block"> <tbody> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;text-align: justify;color:#000000;padding-right:10px"> ' + __message + ' </td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="50"></td> </tr> <tr> <td height="30"></td> </tr> <tr> <td align="left" valign="top" style="line-height:19px;font-size:15px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#000000;padding-right:10px">For support and enquiries, please call any of the following - Ayodeji Oni - <b>0803 345 2825</b>; Oti Edah, <b>0806 590 1348</b>. </td> </tr> <tr> <td height="50" style="border-bottom:1px solid #CCC;"></td> </tr> <tr> <td align="center" valign="top" style="padding-top:10px"> <table> <tbody> <tr> <td width="30%"><img style="max-width:100%" src="http://lawpavilionplus.com/img/logo.png"></td> <td style="line-height:19px;font-size:12px;font-family: Segoe UI,Segoe UI,Arial,Sans-Serif;color:#4b4b4b;padding-right:10px; text-align:center;"><span style="color: #00CC39; font-weight:bold;">For Enquiries and Conference Information </span> Send emails to: support@nba-agc.org and registration@nba-agc.org</td> </tr> </tbody> </table> </td> </tr> </tbody> </table> </td> <td width="40"></td> </tr> </tbody> </table> </div> </div> </div>';

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
				newMessage.html = html_message;
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
