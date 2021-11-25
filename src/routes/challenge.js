const express = require('express');

const Challenge = require('../controllers/challenge');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({message: "You are in the Challenge Endpoint. "});
});

router.get('/check', [], Challenge.check);


module.exports = router;
