'use strict';

var express = require('express');
var controller = require('./vote.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();
router.get('/stats', controller.stats);
router.get('/statsByMembers', controller.statsByMembers);
router.get('/statsByBranches', controller.statsByBranches);

router.use(sessionSec);

router.get('/allReceipts', controller.allReceipts);
router.get('/voteRoll', controller.voteRoll);

router.get('/lawyerStats', controller.lawyerStats);
router.get('/positionStats', controller.positionStats);
router.get('/branchStats', controller.branchStats);

router.get('/boardStats', controller.boardStats);

router.post('/ballot', controller.castVote);
router.get('/receipt', controller.receipt);
router.get('/results/:id', controller.results);

module.exports = router;