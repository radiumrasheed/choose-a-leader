'use strict';

var express = require('express');
var controller = require('./member.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();
router.use(sessionSec);

router.get('/', controller.index);
router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);

module.exports = router;