const express = require('express');
const {check} = require('express-validator');

const WeeklyPrize = require('../controllers/weekly_prize');
const validate = require('../middlewares/validate');

const router = express.Router();

// //INDEX
router.get('/', WeeklyPrize.index);

//STORE
router.post('/', [
    check('position').not().isEmpty().withMessage('Name is required'),
    check('weeklyChallengeId').not().isEmpty().withMessage('Challenge Id is required'),
    check('prizeId').not().isEmpty().withMessage('Prize is required'),
], validate, WeeklyPrize.create);

//SHOW
router.get('/:id',  WeeklyPrize.read);

//UPDATE
router.put('/:id', WeeklyPrize.update);

//DELETE
// router.delete('/:id', WeeklyPrize.destroy);

module.exports = router;
