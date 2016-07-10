'use strict';

var Contestant = require('./contestant.model');

exports.getContestants = function (req, res) {
  Contestant.find({}).sort('fullname').exec(function (err,contestants) {
    return res.json(contestants);
  })
};
