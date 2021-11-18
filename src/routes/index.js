const auth = require('./auth');
const question = require('./question');
const game = require('./game');
const challenge = require('./challenge');
const user = require('./user');
const prize = require('./prize');

const authenticate = require('../middlewares/authenticate');

module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).send({ message: "Welcome to the AUTHENTICATION API. Register or Login to test Authentication."});
    });

    app.use('/api/auth', auth);
    app.use('/api/question', question);

    app.use('/api/game', authenticate, game);
    app.use('/api/challenge', authenticate, challenge);

    app.use('/api/user', authenticate, user);
    app.use('/api/prize', authenticate, prize);
};
