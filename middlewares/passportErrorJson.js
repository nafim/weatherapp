const passport = require('passport');


function authenticateLocal(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({"error": 'Invalid email and password combination'});
        req.user = user;
        return next();
    })(req, res, next);
}

function authenticateJWT(req, res, next) {
    passport.authenticate('jwt', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({"error": 'Invalid token'});
        req.user = user;
        return next();
    })(req, res, next);
}

module.exports = {authenticateLocal, authenticateJWT};