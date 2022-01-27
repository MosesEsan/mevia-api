const express = require('express');
const {check} = require('express-validator');

const QuestionCategory = require('../controllers/category');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', QuestionCategory.index);

//CREATE
router.post('/', [
    check('name').not().isEmpty().withMessage('choice_three is required')
], validate, QuestionCategory.create);

//READ
router.get('/:id',  QuestionCategory.read);

//UPDATE
router.put('/:id', QuestionCategory.update);

//DELETE
// router.delete('/:id', QuestionCategory.destroy);

module.exports = router;
