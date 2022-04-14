const express = require('express');
const {check} = require("express-validator");

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

//USER RANK
router.get('/:id/rank/',  User.get_user_rank);

//POINTS
router.get('/:id/points/',  User.get_user_points);

//READ
router.get('/:id',  User.read);

//UPDATE
router.put('/:id', User.update);

//DELETE
// router.delete('/:id', User.destroy);

router.put('/:id/upload', upload.single("image"), User.profile_image)

router.post('/:id/shipping', [
    check('fullName').not().isEmpty().withMessage('Full Name is required'),
    check('addressLineOne').not().isEmpty().withMessage('Address is required'),
    check('county').not().isEmpty().withMessage('County is required'),
], validate, User.shipping_info);


module.exports = router;
