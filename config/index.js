require('dotenv').config();

module.exports = {
    dbUri       : process.env.DB_URI,
    bcryptSalt  : process.env.SALT,
    appSecrets  : {
        jwt      : process.env.TOKEN_SECRET,
        mail     : process.env.MAIL,
        password : process.env.PASSWORD
    },

}



