
'use strict';

var express = require('express');
var controller = require('./enquiry.controller');

var router = express.Router();

router.post('/getOne', controller.getOne);
router.post('/new', controller.create);
router.get('/getResolved', controller.getResolved);
router.get('/getUnresolved', controller.getUnresolved);



module.exports = router;
