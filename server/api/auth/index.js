'use strict';

var express = require('express');
var controller = require('./auth.controller');
var sessionSec = require('../../components/tools/sessionSec');
var router = express.Router();

router.post('/login', controller.signIn);

router.post('/confirmResetRequest', controller.confirmReset);
router.post('/requestPassword', controller.requestPassword);
router.post('/changePassword', sessionSec, controller.changePassword);

router.get('/me', sessionSec, controller.show);
router.get('/sendCode', sessionSec, controller.sendCode);
router.post('/confirmCode', sessionSec, controller.confirm);

router.get('/', sessionSec, controller.index);
router.get('/:id', sessionSec, controller.show);
router.put('/:id', sessionSec, controller.update);
router.patch('/:id', sessionSec, controller.update);

module.exports = router;