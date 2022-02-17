const express = require('express');

const DailyReward = require('../controllers/daily_reward');

const router = express.Router();

router.get('/', DailyReward.index);

//CREATE
router.post('/', [], DailyReward.create);

// //READ
// router.get('/:id',  DailyReward.read);
//
// //UPDATE
// router.put('/:id', DailyReward.update);

//DELETE
// router.delete('/:id', QuestionTypes.destroy);

module.exports = router;
