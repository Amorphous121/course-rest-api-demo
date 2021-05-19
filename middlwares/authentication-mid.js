const APIError = require('../utilities/APIError');
const passport = require('passport');

const handleJWT =  (req, res, next, roles) => (err, user, info) => {
    try {
        if (err || !user) 
            throw new APIError({ status : 401, message : info.message });

        if (roles !== undefined ) {
            roles = typeof roles == 'string' ? [roles] : roles;
            if (!roles.includes(user.role)) 
                throw new APIError({ status : 403, message : "You don't have sufficient access to this path."});
        }
        req.user = user;
        return next();
    } catch(err) { next (err) }
}

exports.hasAuth = (roles) => (req, res, next) => {
    passport.authenticate('jwt', { session : false }, handleJWT(req, res, next, roles)) (req, res, next);
}


