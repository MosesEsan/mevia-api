const express = require('express');
const multer = require('multer');
const {check} = require('express-validator');

const User = require('../controllers/user');
const validate = require('../middlewares/validate');
const WeeklyPrize = require("../controllers/weekly_prize");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })


//INDEX
router.get('/', User.index);

//CREATE
// router.post('/', [
//     check('email').isEmail().withMessage('Enter a valid email address'),
//     check('username').not().isEmpty().withMessage('You username is required'),
//     check('firstName').not().isEmpty().withMessage('You first name is required'),
//     check('lastName').not().isEmpty().withMessage('You last name is required')
// ], validate, User.create);


//SHOW
router.get('/:id/prizes/',  WeeklyPrize.user_prizes);

router.get('/:id/games/',  WeeklyPrize.user_games);

//READ
router.get('/:id',  User.read);

//UPDATE
router.put('/:id', User.update);

//DELETE
// router.delete('/:id', User.destroy);

router.put('/:id/upload', upload.single("image"), User.profile_image)

router.get('/:id/games', User.games)

module.exports = router;
