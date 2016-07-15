'use strict';

var express = require('express');
var controller = require('./auth.controller');
var sessionSec = require('../../components/tools/sessionSec');
var router = express.Router();

router.post('/login', controller.signIn);

router.post('/confirmResetRequest', controller.confirmReset);
router.post('/resetRequest', controller.getPasswordResetRequest); //no session required
router.post('/verifyResetRequest', controller.sendResetLink);
router.post('/changePassword', controller.changePassword); //no session required
router.post('/newPassword', controller.newPassword);
router.post('/resetPassword', controller.resetPassword);

router.get('/me', sessionSec, controller.show);
router.get('/sendCode', sessionSec, controller.sendCode);
// router.get('/sendOTP', controller.sendOTP);
router.post('/confirmCode', controller.confirm);

router.get('/', sessionSec, controller.index);
router.post('/', controller.create); //dobt is in use
router.get('/:id', sessionSec, controller.show);
router.put('/:id', sessionSec, controller.update);
router.patch('/:id', sessionSec, controller.update);

module.exports = router;
