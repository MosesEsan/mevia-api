const express = require('express');

const Home = require('../controllers/home');
const {check} = require("express-validator");

const router = express.Router();

router.get('/', [], Home.index);


module.exports = router;
