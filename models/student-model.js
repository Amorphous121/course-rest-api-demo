const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ObjectId = mongoose.Schema.Types.ObjectId;
const { bcryptSalt } = require('../config');

const StudentSchema = new mongoose.Schema({

    firstName       : { type : String, required : true},
    lastName        : { type : String, required : true},
    user            : { type : ObjectId, ref : 'user', default : null },
    amount          : { type : Number, default : 20000},
    coursesEnrolled : [{ _id : false , purchasedAt : { type : Date, default : null }, course : {type : ObjectId, ref : 'course', default : null,} }],
    isDeleted       : { type : Boolean, default : false },
}, { timestamps     : true, versionKey : false });

module.exports = mongoose.model('student', StudentSchema, 'students');