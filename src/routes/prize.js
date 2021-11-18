const express = require('express');
// const {check} = require('express-validator');

const Prize = require('../controllers/prize');
// const validate = require('../middlewares/validate');

const router = express.Router();

//
// //INDEX
router.get('/', Prize.index);
//
// //STORE
// router.post('/', [
//     check('email').isEmail().withMessage('Enter a valid email address'),
//     check('username').not().isEmpty().withMessage('You username is required'),
//     check('firstName').not().isEmpty().withMessage('You first name is required'),
//     check('lastName').not().isEmpty().withMessage('You last name is required')
// ], validate, User.store);
//
//SHOW
// router.get('/:id',  Prize.show);
//
// //UPDATE
// // router.put('/:id', upload, User.update);
//
// //DELETE
// router.delete('/:id', User.destroy);

module.exports = router;
