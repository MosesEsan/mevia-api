const express = require('express');
const {check} = require('express-validator');

const Question = require('../controllers/question');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', [
], validate, Question.index);

//CREATE
router.post('/', [
    check('text').not().isEmpty().withMessage('Name is required'),
    check('time').isNumeric().not().isEmpty().withMessage('time is required'),
    check('choice_one').not().isEmpty().withMessage('choice_one is required'),
    check('choice_three').not().isEmpty().withMessage('choice_three is required'),
    check('choice_two').not().isEmpty().withMessage('choice_two is required'),
    check('choice_four').not().isEmpty().withMessage('choice_four is required'),
    check('answer').not().isEmpty().withMessage('answer is required'),
    check('questionTypeId').not().isEmpty().withMessage('questionTypeId is required')
], validate, Question.create);

router.get('/import', [
], validate, Question.import);

router.get('/random', [
], validate, Question.random);

//READ
router.get('/:id',  Question.read);

//UPDATE
router.put('/:id', Question.update);

//DELETE
// router.delete('/:id', Question.destroy);

module.exports = router;
