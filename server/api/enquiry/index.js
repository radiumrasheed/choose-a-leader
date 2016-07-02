
'use strict';

var express = require('express');
var controller = require('./enquiry.controller');

var router = express.Router();


router.get('/getResolved', controller.getResolved);
router.get('/getUnresolved', controller.getUnresolved);
router.post('/:id', controller.getOne);
router.post('/new', controller.create);

module.exports = router;
