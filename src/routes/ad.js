const express = require('express');
const {check} = require('express-validator');

const Ad = require('../controllers/ad');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', Ad.index);

module.exports = router;
