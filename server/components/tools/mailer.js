/**
 * Created by oladapo on 6/27/15.
 */
'use strict';

 var mandrill = require('mandrill-api');

var request = require('request');
var moment = require('moment'),
    Sms = require('./sms.model'),
    async = require('async');

var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);
var message = {
    "html": '',
    "subject": '',
    "from_email": 'elections@nba-agc.org',
    "from_name": 'NBA Elections 2016',
    "to": [{
        "email": '',
        "type": 'to'
    }],
    "headers": {
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
    }
};

var sendMessage = function(message, callback) {
    mandrill_client.messages.send({"message": message}, function(result) {
        callback(result);
    });
};

exports.sendDefaultPassword = function(phone, email, password, sc_number, next) {
    var __message = 'Your username is: ' + sc_number + ' and your default password is: '+ password + '. Please change' +
        ' it after you sign in.';

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
                newMessage.to[0].email = email;

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

exports.sendVerificationSMS = function(phone, accessCode, next) {
    var message = 'Your access code is: '+ accessCode + '. DO NOT DELETE THIS SMS as You WILL NEED THIS CODE TO CAST' +
        ' YOUR VOTE';
    var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

    request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {

        Sms.create({ to: phone, message: message });

        return next();
    });
};

exports.sendConfirmationSMS = function(phone, next) {
    var message = 'Your NBA elektor registration is complete. You are now eligible to cast your ballot.';
    var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

    request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {

        Sms.create({ to: phone, message: message });

        return next();
    });
};

exports.sendBallotReceiptSMS = function(phone, code, signature, next) {
    var message = 'Your votes have been received. This is your Receipt Code: '+ code + '. You can check how you voted' +
        ' with this. Your vote signature is: ' + signature;
    var destination = phone.indexOf("0") == 0 ? phone : "0"+phone;

    request('http://www.smslive247.com/http/index.aspx?cmd=sendquickmsg&owneremail='+process.env.SMS_OWNER_EMAIL+'&subacct='+process.env.SMS_SUB_ACCOUNT+'&subacctpwd='+process.env.SMS_SUB_ACCOUNT_PASSWORD+'&message='+message+'&sender='+process.env.SMS_SENDER+'&sendto='+destination+'&msgtype='+process.env.SMS_MSG_TYPE, function(error, resp, body) {

        Sms.create({ to: phone, message: message });

        return next();
    });
};