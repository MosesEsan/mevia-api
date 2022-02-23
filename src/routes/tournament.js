const express = require('express');
const {check} = require('express-validator');

const Tournament = require('../controllers/tournament');
const TournamentGame = require('../controllers/tournament_game');
const validate = require('../middlewares/validate');
const Game = require("../controllers/game");
const Leaderboard = require("../controllers/leaderboard");
const TournamentWinner = require("../controllers/tournament_winner");
const Prize = require("../controllers/prize");

const router = express.Router();

// //INDEX
// router.get('/', Tournament.index);

//STORE
router.post('/', [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('startDate').not().isEmpty().withMessage('image is required'),
    check('endDate').not().isEmpty().withMessage('description is required'),
    check('daily_points').isNumeric().not().isEmpty().withMessage('description is required'),
], validate, Tournament.create);

//CHECK
router.get('/check', [], Tournament.check_tournament);

//REGISTER
router.post('/register', [
    check('tournament_id').isNumeric().not().isEmpty().withMessage('tournament id is required'),
], validate,Tournament.register_for_tournament);

//CHECK POINTS
router.post('/check_points', [
    check('tournament_id').isNumeric().not().isEmpty().withMessage('tournament id is required'),
], validate,Tournament.check_tournament_stats);

//ACTIVITY
router.post('/activity', [
    check('tournament_id').isNumeric().not().isEmpty().withMessage('tournament id is required'),
], validate,TournamentGame.activity);

//CHECK
router.post('/new', [
    check('tournament_id').isNumeric().not().isEmpty().withMessage('tournament id is required'),
    check('tournament_mode_id').isNumeric().not().isEmpty().withMessage('tournament mode id is required')
], validate, TournamentGame.create);

//CHECK
// router.get('/leaderboard', [], validate, Tournament.tournament_leaderboard);
router.post('/leaderboard', [
    check('tournament_id').not().isEmpty().withMessage('The tournament id is required'),
    check('type').not().isEmpty().withMessage('The type is required'),
], Tournament.tournament_leaderboard);

router.post('/validate', [
    check('game_id').not().isEmpty().withMessage('The Game Id is required'),
    check('questions').not().isEmpty().withMessage('The Questions is required'),
], validate, TournamentGame.validate);

//REWARDS
router.get('/reward/',  Tournament.user_rewards);

//REWARD
router.get('/reward/:id', TournamentWinner.read);

//REDEEM
router.post('/redeem', [
    check('reward_id').not().isEmpty().withMessage('Reward Id is required'),
], TournamentWinner.redeem);

//SHOW
router.get('/:id',  TournamentGame.read);

//UPDATE
router.put('/:id', Tournament.update);

//DELETE
// router.delete('/:id', Challenge.destroy);

module.exports = router;
