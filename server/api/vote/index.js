'use strict';

var express = require('express');
var controller = require('./vote.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();
router.get('/stats', controller.stats);
router.get('/statsByMembers', controller.statsByMembers);
router.get('/statsByBranches', controller.statsByBranches);

router.use(sessionSec);

router.post('/ballot', controller.castVote);
router.get('/receipt', controller.receipt);
router.get('/results/:id', controller.results);

router.get('/', controller.index);

router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);

module.exports = router;