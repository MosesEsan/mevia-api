const express = require('express');

const Leaderboard = require('../controllers/leaderboard');
const {check} = require("express-validator");
const validate = require("../middlewares/validate");
const Auth = require("../controllers/auth");

const router = express.Router();

router.post('/', [
    check('type').not().isEmpty().withMessage('The type is required'),
], Leaderboard.index);

module.exports = router;
