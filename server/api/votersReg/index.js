'use strict';

var express = require('express');
var controller = require('./votersReg.controller');
var router = express.Router();

router.get('/getUpdate', controller.getUpdatedBranches);
router.get('/getCount', controller.getCount);
router.get('/me', controller.getMe);
router.post('/', controller.index);
router.post('/details', controller.details);
router.post('/search', controller.searchDetails);
router.post('/save', controller.update);

var sessionSec = require('../../components/tools/sessionSec');

router.post('/create', controller.create);

module.exports = router;
