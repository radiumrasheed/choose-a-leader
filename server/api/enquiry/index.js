
'use strict';

var express = require('express');
var controller = require('./enquiry.controller');

var router = express.Router();

router.post('/new', controller.create);

module.exports = router;
