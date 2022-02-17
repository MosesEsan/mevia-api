const express = require('express');
const {check} = require('express-validator');

const Reward = require('../controllers/reward');
const validate = require('../middlewares/validate');

const router = express.Router();

// //INDEX
router.get('/', Reward.index);

//STORE
router.post('/', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('image').not().isEmpty().withMessage('image is required'),
    check('description').not().isEmpty().withMessage('description is required'),
    check('points').not().isEmpty().withMessage('points is required')
], validate, Reward.create);

//REDEEM
router.post('/redeem', [
    check('prize_id').not().isEmpty().withMessage('Prize Id is required'),
], Reward.redeem);

//REDEEM REWARD
router.get('/redeemed/', Reward.user_rewards);

//READ
router.get('/:id',  Reward.read);

//UPDATE
router.put('/:id', Reward.update);

//DELETE
// router.delete('/:id', Prize.destroy);


module.exports = router;
