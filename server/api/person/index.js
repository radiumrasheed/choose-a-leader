'use strict';

var express = require('express');
var controller = require('./person.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();
// router.use(sessionSec);
// router.get('/', sessionSec, controller.index);

router.post('/', controller.create);
// router.get('/:id', sessionSec, controller.show);
// router.put('/:id', sessionSec, controller.update);
// router.patch('/:id', sessionSec, controller.update);

module.exports = router;
