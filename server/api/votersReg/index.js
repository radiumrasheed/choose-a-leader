'use strict';

var express = require('express');
var controller = require('./votersReg.controller');
var router = express.Router();
var sessionSec = require('../../components/tools/sessionSec');

router.get('/getUpdate', controller.getUpdatedBranches);
router.get('/getCount', controller.getCount);
router.get('/me', controller.getMe);
router.post('/', controller.index);
router.post('/details', controller.details);
router.post('/search', controller.searchDetails);
router.post('/save', controller.update);

//APIs after this line will require  session to work
router.use(sessionSec);

router.post('/create', sessionSec, controller.create);
router.post('/branchMembers', sessionSec, controller.branchMembers);
router.post('/checkVotersName', sessionSec, controller.checkVotersName);


module.exports = router;
