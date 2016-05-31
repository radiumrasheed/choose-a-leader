'use strict';

var express = require('express');
var controller = require('./votersReg.controller');

var router = express.Router();

router.post('/', controller.index);
router.post('/details', controller.details);

module.exports = router;
