const express = require('express');
const {check} = require('express-validator');

const QuestionTypes = require('../controllers/question_types');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', [
], validate, QuestionTypes.index);


module.exports = router;
