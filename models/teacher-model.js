const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const TeacherSchema = new mongoose.Schema({

    firstName       : { type : String, required : true},
    lastName        : { type : String, required : true},
    user            : { type : ObjectId, ref : 'user', default : null },
    amount          : { type : Number, default : 40000},
    coursesEnrolled : [{ _id : false , purchasedAt : { type : Date, default : null }, course : {type : ObjectId, ref : 'course', default : null,} }],
    coursesCreated  : [{ type : ObjectId, ref : 'course', default : null}],
    isDeleted       : { type : Boolean, default : false },
}, { timestamps     : false, versionKey : false });

module.exports = mongoose.model('teacher', TeacherSchema, 'teachers');