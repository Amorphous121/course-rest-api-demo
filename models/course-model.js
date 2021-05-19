const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const CourseSchema = new mongoose.Schema({

    name                : { type: String, required: true },
    price               : { type: Number, required: true },
    createdBy           : { type: ObjectId, ref: 'teacher', required: true, },
    enrolledStudents    : [{ type: ObjectId, ref: 'student', default: null }],
    enrolledTeachers    : [{ type: ObjectId, ref: 'teacher', default: null }],
    isDeleted           : { type : Boolean, default : false },
    deletedAt           : { type : Date , default : null },
    deletedBy           : { type : ObjectId, ref : 'teacher', default : null }

}, { versionKey: false, timestamps: true });

module.exports = mongoose.model('course', CourseSchema, 'courses');

