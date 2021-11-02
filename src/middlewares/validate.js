const {validationResult} = require('express-validator');

module.exports = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        let error = {};
        let message = "";
        errors.array().map((err) => {
            error[err.param] = err.msg;
            message = message + err.msg;
        });

        return res.status(400).json({ message, errors: error });
    }

    next();
};
