'use strict';

var express = require('express');
var controller = require('./registration.controller');

var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();

router.get('/', sessionSec, controller.index);
router.get('/stats', sessionSec, controller.stats);
router.get('/:id', sessionSec, controller.show);

module.exports = router;