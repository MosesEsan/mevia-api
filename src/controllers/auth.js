const User = require('../models/user');
const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient()

const logger = require('../../logger')();
const {generateJWT} = require('../utils/generateToken');
const {twilio, VERIFICATION_SID} = require('../config/twilio');

// @route POST api/auth/register
// @desc Register user and sends a verification code
// @access Public
exports.register = async (req, res) => {
    try {
        const {username, phoneNumber} = req.body;

        // // check duplicate phone Number
        const phoneExist = await prisma.user.findUnique({where: {phoneNumber}})
        if (phoneExist) return res.status(401).json({message: 'The phone number you have entered is already associated with another account.'});

        // Make sure this account doesn't already exist
        const userCheck = await prisma.user.findUnique({where: {username}})
        if (userCheck) return res.status(401).json({message: 'The username you entered is not available.'});

        // create  new user
        const user = await prisma.user.create({data: {...req.body}})

        await sendVerificationCode(user, req, res);

    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, error})
    }
};

// @route POST api/auth/login
// @desc Login user and sends a verification code
// @access Public
exports.login = async (req, res) => {
    try {
        const {phoneNumber} = req.body;

        const user = await prisma.user.findUnique({where: {phoneNumber}})
        if (!user) return res.status(401).json({msg: 'The phone number ' + phoneNumber + ' is not associated with any account. Double-check your email address and try again.'});

        await sendVerificationCode(user, req, res);
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};


// @route GET api/verify/:token
// @desc Verify token passed
// @access Public
exports.verify = async (req, res) => {
    let verificationResult;
    let phoneNumber = req.body.phoneNumber;

    let errMessage = "Incorrect verification code. Please try again later."

    try {
        verificationResult = await twilio.verify.services(VERIFICATION_SID)
            .verificationChecks
            .create({code: req.body.verificationCode, to: req.body.phoneNumber});

        console.log(verificationResult);

        // Verify and save the user
        if (verificationResult.status === 'approved') {
            // Login successful, write token, and send back user
            const user = await prisma.user.findUnique({where: {phoneNumber}})
            res.status(200).json({token: generateJWT(), user});
        } else {
            res.status(500).json({success: false, message: errMessage})
        }

    } catch (e) {
        logger.error(e);
        res.status(500).json({success: false, message: errMessage})
    }

};

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
    try {
        const {phoneNumber} = req.body;

        const user = await User.findOne({phoneNumber});

        if (!user) return res.status(401).json({msg: 'The phone number ' + phoneNumber + ' is not associated with any account. Double-check and try again.'});

        await sendVerificationCode(user, req, res);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

// === VERIFICATION
// @desc Sends Verification Token using Twilio
// @access Private
async function sendVerificationCode(user, req, res) {
    try {
        let verificationRequest = await twilio.verify.services(VERIFICATION_SID)
            .verifications
            .create({to: user.phoneNumber, channel: 'sms'})
        logger.debug(verificationRequest);

        res.status(200).json({message: 'A verification code has been sent to ' + user.phoneNumber + '.'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({success: false, message: error.message})
    }
}
