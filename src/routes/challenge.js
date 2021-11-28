const express = require('express');
const {check} = require('express-validator');

const Challenge = require('../controllers/challenge');
const validate = require('../middlewares/validate');

const router = express.Router();

// //INDEX
router.get('/', Challenge.index);

//STORE
router.post('/', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('startDate').not().isEmpty().withMessage('image is required'),
    check('endDate').not().isEmpty().withMessage('description is required'),
], validate, Challenge.create);

//CHECK
router.get('/check', [], Challenge.check);

//SHOW
// router.get('/:id',  Challenge.read);

//UPDATE
router.put('/:id', Challenge.update);

//DELETE
// router.delete('/:id', Challenge.destroy);

module.exports = router;
