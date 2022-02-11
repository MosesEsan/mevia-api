const express = require('express');
const {check} = require('express-validator');

const TournamentWinner = require('../controllers/tournament_winner');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', TournamentWinner.index);

//CREATE
// router.post('/', [
//     check('name').not().isEmpty().withMessage('choice_three is required'),
//     check('points').isNumeric().not().isEmpty().withMessage('points is required')
// ], validate, TournamentWinner.create);

//READ
router.get('/:id',  TournamentWinner.read);

//UPDATE
router.put('/:id', TournamentWinner.update);

//DELETE
// router.delete('/:id', QuestionTypes.destroy);

module.exports = router;
