const auth = require('./auth');
const home = require('./home');
const question = require('./question');
const question_types = require('./question-types');
const category = require('./category');
const weekly_prize = require('./weekly_prize');
const game = require('./game');
const challenge = require('./challenge');
const tournament = require('./tournament');
const user = require('./user');
const prize = require('./prize');
const admin_prize = require('./admin/prize');
const leaderboard = require('./leaderboard');
const notification = require('./notification');

const authenticate = require('../middlewares/authenticate');
const express = require("express");

module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).send({ message: "Welcome to the AUTHENTICATION API. Register or Login to test Authentication."});
    });

    /*
    Serve all files/folders inside of the 'uploads' directory
    And make them accessible through http://localhost:3001/uploads.
    */
    app.use(express.static(__dirname + '/public'));
    app.use('/uploads', express.static('uploads'));


    //ADMIN ROUTES
    app.use('/api/admin/user', user);
    app.use('/api/admin/question', question);
    app.use('/api/admin/questionTypes', question_types);
    app.use('/api/admin/category', category);
    app.use('/api/admin/weeklyPrize', weekly_prize);
    app.use('/api/admin/challenge', challenge);
    app.use('/api/admin/tournament', tournament);
    app.use('/api/admin/leaderboard', leaderboard);
    app.use('/api/admin/prize', admin_prize);

    //USER ROUTES
    app.use('/api/auth', auth);
    app.use('/api/home', authenticate, home);
    app.use('/api/user', authenticate, user);
    app.use('/api/challenge', authenticate,challenge);
    app.use('/api/tournament', authenticate, tournament);
    app.use('/api/game', authenticate, game);
    app.use('/api/leaderboard', authenticate, leaderboard);
    app.use('/api/notification', authenticate, notification);

    app.use('/api/prize', authenticate, prize);
    // app.use('/api/prize', prize);
};
