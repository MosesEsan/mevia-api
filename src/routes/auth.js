const express = require('express');
const {check} = require('express-validator');

const Auth = require('../controllers/auth');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Auth Endpoint. Register or Login to test Authentication."});
});

router.post('/register', [
    check('username').not().isEmpty().withMessage('Your username is required'),
    check('countryCode').not().isEmpty().withMessage('Country code is required'),
    check('phoneNumber').not().isEmpty().withMessage('Phone number is required'),
    check('formattedPhoneNumber').not().isEmpty().withMessage('Formatted phone number is required')
], validate, Auth.register);

router.post("/login", [
    check('formattedPhoneNumber').not().isEmpty().withMessage('Your phone number is required'),
], validate, Auth.login);

// Verification
router.post("/verify", [
    check('phoneNumber').not().isEmpty().withMessage('Your phone number is required'),
    check('formattedPhoneNumber').not().isEmpty().withMessage('Formatted phone number is required'),
    check('verificationCode').not().isEmpty().withMessage('Your verification code is required'),
], validate, Auth.verify);

router.post('/resend', Auth.resendToken);

module.exports = router;
