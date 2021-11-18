const express = require('express');
const {check} = require('express-validator');

const Game = require('../controllers/game');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Question Endpoint. "});
});

router.get('/new', [
], validate, Game.create);

router.post('/validate', [
    check('game_id').not().isEmpty().withMessage('The Game Id is required'),
    // check('questions').not().isEmpty().withMessage('The Questions is required'),
], validate, Game.validate);


module.exports = router;
