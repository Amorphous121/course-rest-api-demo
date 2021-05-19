const passport = require('passport');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const APIError = require('../utilities/APIError');
const USER = require('../models/user-model');
const { generateJWT } = require('../utilities/helper');

const { appSecrets, bcryptSalt } = require('../config');


exports.login = async (req, res, next) => {

    try {
        passport.authenticate('login', async(err, user, info) => {
            if (err || !user || info) {
                 let error = new APIError({ status : 401, message : info.message });
                return next(error)
            }
            req.login(user, { session : false }, async (err) => {
                if (err) return next(err.message);
                const body = { _id : user._id, email : user.email, role : user.role };
                const token = generateJWT({user : body});
                return res.sendJson(200, token);    
            })
        })(req, res, next);
    } catch(err) {
        next(err)
    }
}

exports.getForgotPassword = async (req, res) => {
    res.render('forgot-password');   
}

exports.postForgotPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await USER.findOne({ email , isDeleted : false });

    if (!user) throw new APIError({ status : 404, message : "User doesn't exists!"});

    // user Exists now create a unique link for 15m

    let secret = appSecrets.jwt + user.password;
    const payload = {
        email : user.email,
        _id : user._id,
    }
    const token = JWT.sign(payload, secret, { expiresIn : '15m' });
    const link = `http://localhost:8081/api/auth/reset-password/${user._id}/${token}`;


    /*  To Send link to the mail */

    // let transporter = nodemailer.createTransport({
    //     service : 'gmail',
    //     auth : {
    //         user : appSecrets.mail,
    //         pass : appSecrets.password
    //     }
    // });

    // var mailOptions = {
    //     from : appSecrets.mail,
    //     to : user.email,
    //     subject : "Password reset link",
    //     text : `Click on this link to reset your password => ${link}`
    // }

    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error)
    //         res.send(error.message)
    //     else  res.send('Password reset link has been sent to your email...');
    // });

    res.sendJson(200, { resetLink : link });
}


exports.getResetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    // Check if the id exists in database
    const user = await USER.findOne({ _id : id , isDeleted : false });
    
    if (!user) 
        throw new APIError({ status : 400, message : "Invalid Id."});
    
    // now we have user with given Id.
    const secret = appSecrets.jwt + user.password;
    try {
        const payload = JWT.verify(token, secret);
        res.render('reset-password', { email : user.email });
        
    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    }

    // res.render('reset-password', { email : user.email });

}

exports.postResetPassword = async (req, res, next) => {
    const { id, token } = req.params;
    const { password1 , password2 } = req.body;
    let user = await USER.findOne({ _id : id , isDeleted : false });
    
    const schema = Joi.object({
        password1 : Joi.string().min(4).max(15).trim().required(),
        password2 : Joi.string().min(4).max(15).trim().required(),
    })

    let result = schema.validate(req.body);

    if (result.error) 
        throw new APIError({status : 400,  message: result.error.details[0].message });

    if (!user) 
        throw new APIError({ status : 400, message : "Invalid Id."});
    
    const secret = appSecrets.jwt + user.password;
    try {
        const payload = JWT.verify(token, secret);
        if(password1 !== password2)
            return res.send("Your password do not match!");
        
        user = await USER.findOne({ _id : payload._id, email : payload.email , isDeleted : false });
        if (user) {
            const hash = await bcrypt.hash(password1, parseInt(bcryptSalt));
            let updatedUser = await USER.findOneAndUpdate({ _id : payload._id, email : payload.email }, { $set : { password : hash }});
            if (updatedUser)
                res.send(updatedUser);
        }

    } catch (err) {
        console.log(err.message);
        res.send(err.message);
    }
}