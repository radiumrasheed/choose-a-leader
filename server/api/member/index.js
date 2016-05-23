'use strict';

var express = require('express');
var controller = require('./member.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();
// router.use(sessionSec);
router.get('/createLink', controller.createLink);
router.get('/detailLink', controller.detailLink);
router.get('/me', controller.showMember);
router.put('/createUser', controller.createUser);
router.get('/', sessionSec, controller.index);

router.get('/:id', sessionSec, controller.show);
router.put('/:id', sessionSec, controller.update);
router.patch('/:id', sessionSec, controller.update);

module.exports = router;
