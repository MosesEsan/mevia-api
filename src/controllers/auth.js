const prisma = require("../config/prisma");

const logger = require('../../logger')();
const {generateJWT} = require('../utils/generateToken');
const {twilio, VERIFICATION_SID} = require('../config/twilio');

const test_numbers = ["+353834800091", "+353834800092", "+353834800093", "+353834800094", "+353834800095", "+353862709768"];
const UserController = require('../controllers/user');
// @route POST api/auth/register
// @desc Register user and sends a verification code
// @access Public
exports.register = async (req, res) => {
    try {
        const {username, formattedPhoneNumber} = req.body;

        // // check duplicate phone Number
        const phoneExist = await prisma.user.findUnique({where: {formattedPhoneNumber}})
        if (phoneExist) return res.status(401).json({error: {message: "The phone number you have entered is already associated with another account."}});

        // Make sure this account doesn't already exist
        const userCheck = await prisma.user.findUnique({where: {username}})
        if (userCheck) return res.status(401).json({error: {message: 'The username you entered is not available.'}});

        // create  new user
        const user = await prisma.user.create({data: {...req.body, userTypeId:5}})

        // await sendVerificationCode(user, req, res);
        await addPoints(user, req, res);
    } catch (error) {
        res.status(500).json(error)
    }
};


// @route POST api/auth/login
// @desc Login user and sends a verification code
// @access Public
exports.login = async (req, res) => {
    try {
        const {formattedPhoneNumber} = req.body;

        const user = await prisma.user.findUnique({where: {formattedPhoneNumber}})
        if (!user) return res.status(401).json({error: {message: 'The phone number ' + formattedPhoneNumber + ' is not associated with any account.'}});

        await sendVerificationCode(user, req, res);
    } catch (error) {
        res.status(500).json(error)
    }
};

// @route GET api/verify/:token
// @desc Verify code passed
// @access Public
exports.verify = async (req, res) => {
    let verificationResult;
    let {verificationCode, formattedPhoneNumber} = req.body;

    let errMessage = "Incorrect verification code. Please try again later."

    try {
        let isTestAccount = (test_numbers.includes(formattedPhoneNumber) && verificationCode === 123456)

        if (!isTestAccount){
            verificationResult = await twilio.verify.services(VERIFICATION_SID)
                .verificationChecks
                .create({code: verificationCode, to: formattedPhoneNumber});

            // Verify and save the user
            if (verificationResult.status === 'approved') {
                // Login successful, write token, and send back user
                let user = await prisma.user.findUnique({
                    where: {formattedPhoneNumber},
                    include: {
                        userType: true,
                    }
                })

                user = await UserController.get_user_stats(user)
                res.status(200).json({token: generateJWT(user), user});
            } else {
                res.status(500).json({success: false, message: errMessage})
            }
        }else{
            console.log("Test Account")
            // Login successful, write token, and send back user
            let user = await prisma.user.findUnique({
                where: {formattedPhoneNumber},
                include: {
                    userType: true,
                }
            })

            user = await UserController.get_user_stats(user)
            res.status(200).json({token: generateJWT(user), user});
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

        if (!user) return res.status(401).json({error: {message: 'The phone number ' + phoneNumber + ' is not associated with any account. Double-check and try again.'}});

        await sendVerificationCode(user, req, res);
    } catch (error) {
        res.status(500).json(error)
    }
};

// === VERIFICATION
// @desc Sends Verification Token using Twilio
// @access Private
async function sendVerificationCode(user, req, res) {
    try {
        let isTestAccount = test_numbers.includes(user.formattedPhoneNumber)

        if (isTestAccount){
            res.status(200).json({message: 'A verification code has been sent to ' + user.formattedPhoneNumber + '.'});
        }else{

            let verificationRequest = await twilio.verify.services(VERIFICATION_SID)
                .verifications
                .create({to: user.formattedPhoneNumber, channel: 'sms'})
            logger.debug(verificationRequest);

            res.status(200).json({message: 'A verification code has been sent to ' + user.formattedPhoneNumber + '.'});
        }

    } catch (error) {
        logger.error(error);
        res.status(500).json(error)
    }
}



async function addPoints(user, req, res) {
    try {
        await prisma.userPoints.create({data: {
                userId: user.id,
                points: 250
            }})

        await sendVerificationCode(user, req, res);
    } catch (error) {
        await prisma.user.delete({where: {id: user.id}})
        res.status(500).json({success: false, error: error.message})
    }
}
