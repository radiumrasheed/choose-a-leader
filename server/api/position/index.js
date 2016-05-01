'use strict';

var express = require('express');
var controller = require('./position.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();

router.get('/ballotImage/:id', controller.photo);

//router.use(sessionSec);

router.get('/', sessionSec, controller.index);
router.get('/ballotPaper', sessionSec, controller.ballot);

router.post('/', sessionSec, controller.create);
router.post('/:id', sessionSec, controller.addCandidate);
router.get('/:id', sessionSec, controller.show);
router.put('/:id', sessionSec, controller.update);
router.patch('/:id', sessionSec, controller.update);
router.delete('/:id', sessionSec, controller.destroy);
router.delete('/:id/candidates/:candidate_id', sessionSec, controller.destroyCandidate);

module.exports = router;
