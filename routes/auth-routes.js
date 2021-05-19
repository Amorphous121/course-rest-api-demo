const router = require('express').Router();
const Auth = require('../controllers/auth-controller'); 
const nodemailer = require('nodemailer');


router.post('/login', Auth.login);

router.get('/forgot-password/', Auth.getForgotPassword);

router.post('/forgot-password/', Auth.postForgotPassword);

router.get('/reset-password/:id/:token', Auth.getResetPassword);

router.post('/reset-password/:id/:token', Auth.postResetPassword);

module.exports = router;