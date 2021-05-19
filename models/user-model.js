const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ObjectId = mongoose.Schema.Types.ObjectId;

const { bcryptSalt } = require('../config');

const UserSchema = new mongoose.Schema({

    email           : { type : String, required : true, unique : true, lowercase : true },
    password        : { type : String, required : true},
    role            : { type : ObjectId, ref : 'role', default : null },
    isDeleted       : { type : Boolean, default : false }
} , { versionKey : false, timestamps : true })

UserSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, parseInt(bcryptSalt));
    next();
});

UserSchema.methods.isValidPassword = async function(password) {
   
    let validate =  await bcrypt.compare(password, this.password);
    return validate;
}

module.exports = mongoose.model('user', UserSchema, 'users');