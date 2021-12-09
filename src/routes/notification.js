const express = require('express');

const {check} = require("express-validator");

const Notification = require('../controllers/notification');

const router = express.Router();

router.post('/', [
    check('device_token').not().isEmpty().withMessage('The Device Token is required'),
], Notification.store);

module.exports = router;
