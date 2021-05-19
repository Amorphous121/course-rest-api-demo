const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const USER = require('../models/user-model');



passport.use('login', new localStrategy({ 
    usernameField : 'email', 
    passwordField : 'password'
},
    async (email, password, done) => {
        try {
            const user = await USER.findOne({ email : email, isDeleted : false });
            if (!user) 
                return done(null, false, { message : "User doesn't exists!" });

            const validate = await user.isValidPassword(password)
            if (!validate)
                return done(null, false, {message : "Invalid password!"});
                
            return done(null, user);

        } catch (err) { done(err) }
    }
    
));

passport.use(new jwtStrategy({
    secretOrKey : process.env.TOKEN_SECRET,
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
},
    async (token, done) => {
        let user = await USER.findOne({ _id : token.user._id, isDeleted : false })
                     .populate({path : 'role', select : { _id : 0, name : 1}});
        if (user) {
            token.user.role = user.role.name;
            return done(null, token.user);
        }
        else return done(null, false, { message : "Invalid token "});
    }
))