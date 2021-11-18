const jwt = require('jsonwebtoken');

function generateJWT(user) {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    let payload = {
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
    });
}

module.exports = { generateJWT };
