const express = require('express');
const {check} = require('express-validator');

const Prize = require('../controllers/prize');
const validate = require('../middlewares/validate');
const WeeklyPrize = require("../controllers/weekly_prize");

const router = express.Router();

// //INDEX
router.get('/', Prize.index);

//STORE
router.post('/', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('image').not().isEmpty().withMessage('image is required'),
    check('description').not().isEmpty().withMessage('description is required'),
    check('points').not().isEmpty().withMessage('points is required')
], validate, Prize.create);

//REDEEM
router.post('/redeem', [
    check('prize_id').not().isEmpty().withMessage('Prize Id is required'),
], Prize.redeem);

//CLAIM
router.post('/claim', [
    check('weeklyPrizeId').not().isEmpty().withMessage('Weekly Prize Id is required'),
    check('fullname').not().isEmpty().withMessage('Name is required'),
    check('phoneNumber').not().isEmpty().withMessage('Phone Number is required'),
    check('addressLineOne').not().isEmpty().withMessage('Address Line 1 is required'),
    check('city').not().isEmpty().withMessage('City is required')
], Prize.claim);






//READ
router.get('/:id',  Prize.read);

//UPDATE
router.put('/:id', Prize.update);

//DELETE
// router.delete('/:id', Prize.destroy);


module.exports = router;
