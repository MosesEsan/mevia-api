const express = require('express');
const {check} = require('express-validator');

const Prize = require('../controllers/prize');
const validate = require('../middlewares/validate');

const router = express.Router();

// //INDEX
router.get('/', Prize.index);

//STORE
router.post('/', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('image').not().isEmpty().withMessage('image is required'),
    check('description').not().isEmpty().withMessage('description is required'),
    check('points').not().isEmpty().withMessage('points is required')
], validate, Prize.store);

//SHOW
router.get('/:id',  Prize.show);

//UPDATE
router.put('/:id', Prize.update);

//DELETE
// router.delete('/:id', Prize.destroy);


module.exports = router;
