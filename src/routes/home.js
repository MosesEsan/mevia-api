const express = require('express');

const Home = require('../controllers/home');
const {check} = require("express-validator");

const router = express.Router();

router.get('/', [], Home.index);
router.get('/rules', [], Home.rules);


module.exports = router;
