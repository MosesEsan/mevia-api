const express = require('express');
const multer = require('multer');
const {check} = require('express-validator');

const User = require('../controllers/user');
const validate = require('../middlewares/validate');
const WeeklyPrize = require("../controllers/weekly_prize");
const WeeklyGame = require("../controllers/game");
const upload = require("../config/upload");

const router = express.Router();

function isAdmin(req, res, next) {
    let user = req.user;
    let isAdmin = user.role === "admin";
    if (isAdmin) next();
    else return res.status(401).json({error :{message: "Sorry, you don't have the requiresd permission."}});
}

//INDEX
router.get('/', User.index);

//CREATE
// router.post('/', [
//     check('email').isEmail().withMessage('Enter a valid email address'),
//     check('username').not().isEmpty().withMessage('You username is required'),
//     check('firstName').not().isEmpty().withMessage('You first name is required'),
//     check('lastName').not().isEmpty().withMessage('You last name is required')
// ], validate, User.create);

//PRIZES
router.get('/:id/prizes/',  WeeklyPrize.user_prizes);

//GAMES
router.get('/:id/games/',  WeeklyGame.user_games);

//READ
router.get('/:id',  User.read);

//UPDATE
router.put('/:id', User.update);

//DELETE
// router.delete('/:id', User.destroy);

router.put('/:id/upload', upload.single("image"), User.profile_image)


module.exports = router;
