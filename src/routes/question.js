const express = require('express');
const {check} = require('express-validator');

const Question = require('../controllers/question');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Question Endpoint. "});
});

router.get('/import', [
], validate, Question.import);

router.get('/random', [
], validate, Question.random);

module.exports = router;
