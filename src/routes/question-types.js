const express = require('express');
const {check} = require('express-validator');

const QuestionTypes = require('../controllers/question_types');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', QuestionTypes.index);

//CREATE
router.post('/', [
    check('name').not().isEmpty().withMessage('choice_three is required'),
    check('points').isNumeric().not().isEmpty().withMessage('points is required')
], validate, QuestionTypes.create);

//READ
router.get('/:id',  QuestionTypes.read);

//UPDATE
router.put('/:id', QuestionTypes.update);

//DELETE
// router.delete('/:id', QuestionTypes.destroy);

module.exports = router;
