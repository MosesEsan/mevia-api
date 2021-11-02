const {TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFICATION_SID} = process.env;
const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
module.exports = {twilio, VERIFICATION_SID};
