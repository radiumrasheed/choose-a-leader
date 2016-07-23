/**
 * Created by DrCraig-PC on 25/05/2016.
 */
'use strict';
var CronJob = require('cron').CronJob;
var mongoose = require('mongoose');
var _ = require('lodash');
var mailer = require('./components/tools/mailer');
var config = require('./config/environment');
var VotersRegister = require('./api/votersReg/votersReg.model');
var NewData = require('./api/newData/newData.model');
var Member = require('./api/member/member.model');
mongoose.connect(config.mongo.uri, config.mongo.options);


// extract data from voters register for export
// new CronJob('*/1 * * * *', function () {
//     VotersRegister.find({getData :false, deleted:false}).limit(200).exec(function (err,data) {
//       if (data.length){
//         _(data).forEach(function (datum) {
//           var newData = {};
//           if (datum.confirmed == true){
//             newData.Fullname = datum.fullname;
//             newData.UpdatedName = datum.updatedSurname+' '+datum.updatedMiddleName+' '+datum.updatedFirstName;
//             newData.DataStatus = 'confirmed';
//             newData.Branch = datum.branchCode;
//           }
//           if (datum.updated == undefined){
//             newData.Fullname = datum.fullname;
//             newData.Branch = datum.branchCode;
//             newData.DataStatus = 'not updated';
//             if (datum.email != 'NOT AVAILABLE') {
//               var end = datum.email.indexOf('@');
//               newData.Email = datum.email.replace(datum.email.substring(0, end), '*********');
//             }
//             else{newData.Email = datum.email;}
//             if (datum.mobileNumber != 'INVALID MOBILE') {
//               newData.MobileNumber = datum.mobileNumber.replace(datum.mobileNumber.substring(0, 6), '*******');
//             }
//             else{newData.MobileNumber = datum.mobileNumber;}
//           }
//           if(datum.updated == true && datum.confirmed == false){
//             newData.UpdatedName = datum.updatedSurname+' '+datum.updatedMiddleName+' '+datum.updatedFirstName;
//             newData.Fullname = datum.fullname;
//             newData.Branch = datum.branchCode;
//             newData.UpdatedPhone = datum.updatedPhone.replace(datum.updatedPhone.substring(0, 6), '*******');
//             var nd = datum.updatedEmail.indexOf('@');
//             newData.UpdatedEmail = datum.updatedEmail.replace(datum.updatedEmail.substring(0, nd), '***********');
//             newData.EnrollmentNo = datum.scNumber;
//             newData.UpdatedEnrollmentNo = datum.sc_number;
//             newData.DataStatus = 'updated but not yet confirmed';
//             if (datum.email != 'NOT AVAILABLE') {
//               var vend = datum.email.indexOf('@');
//               newData.Email = datum.email.replace(datum.email.substring(0, vend), '*********');
//             }
//             else{newData.Email = datum.email;}
//             if (datum.mobileNumber != 'INVALID MOBILE') {
//               newData.MobileNumber = datum.mobileNumber.replace(datum.mobileNumber.substring(0, 6), '*******');
//             }
//             else{newData.MobileNumber = datum.mobileNumber;}
//
//           }
//           NewData.create(newData, function (err, member) {
//             if (err) {
//               console.log(err);
//             }
//             if(member){
//               var updated = _.merge(datum, {getData:true});
//               updated.save(function (err) {
//                 if (err) { console.log(err); }
//                 console.log('Data Successfully Saved')
//               });
//             }
//           });
//         })
//       }
//     });
//   }, null, true, 'Africa/Lagos'
// );

new CronJob('*/1 * * * *', function () {
  Member.find({setupLink_sent:{$ne:true},inHouse:true,verified:1}).limit(20).exec(
    function (err, allMembers) {
      console.log(allMembers);
      if (err) {
        return console.log("There was a server error "+err)
      }
      if (allMembers.length) {
        _(allMembers).forEach(function (member) {
          mailer.sendSetupLink(member.phone, member.email, member._id, member.surname + ' ' + member.firstName, function () {

            console.log('Email and Sms was sent to ' + member.email + ' and '+member.phone+' respectively');
          });
          Member.update({_id: member._id}, {$set: {setupLink_sent: true}}, function (e) {
            if (e) {
              console.log(e);
            }
          });
        });

      } else {
        return;
      }
    }
  )
  }, null, true, 'Africa/Lagos'
);


new CronJob('*/1 * * * *', function () {
    VotersRegister.find({notUpdatedSms:false, deleted: false,updated:{ $exists: false },mobileNumber:{ $ne: "INVALID MOBILE" }}).limit(50).exec(function (err,data) {
      if (data.length){
        _(data).forEach(function (datum) {
          mailer.sendNotUpdatedSms(datum.mobileNumber);

          var updated = _.merge(datum, {notUpdatedSms:true});
          updated.save(function (err) {
            if (err) { console.log(err); }
            console.log('Data Successfully Saved')
          });
        })
      }
    });
  }, null, true, 'Africa/Lagos'
);

//agenda.every('minute', 'Send Accreditation Link To 50 Members');

// var job = new CronJob({
// 	cronTime
// })
//
// exports.start = function () {
// 	// agenda.start();
// }
