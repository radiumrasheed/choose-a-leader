'use strict';

var express = require('express');
var Controller = require('./contestant.controller');

var router = express.Router();

router.get('/list', Controller.getContestants);

module.exports = router;
