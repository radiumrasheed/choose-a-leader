'use strict';

var express = require('express');
var controller = require('./poll.controller');
var sessionSec = require('../../components/tools/sessionSec');

var router = express.Router();
router.use(sessionSec);

router.get('/', controller.index);
router.get('/user_polls', controller.user_polls);
router.get('/published_polls', controller.published_polls);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;