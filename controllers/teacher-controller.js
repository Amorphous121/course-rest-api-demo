const TEACHER = require('../models/teacher-model');
const STUDENT = require('../models/student-model');
const COURSE =  require('../models/course-model');
const ROLE = require('../models/role-model');
const USER = require('../models/user-model');
const APIError = require('../utilities/APIError');
const { removeFields, toObject } = require('../utilities/helper');


exports.create = async (req, res, next) => {
    let payload = req.body;
    const role  = await ROLE.findOne({ name : 'teacher'});
    if (!role) throw new APIError({ status : 500, message : "System roles are not generated yet."})

    const user = await USER.create({
        email : payload.email,
        password : payload.password,
        role : role._id
    })

    const teacher = await TEACHER.create({
        firstName   : payload.firstName,
        lastName    : payload.lastName,
        user        : user._id
    })
   
    payload = {
        _id : teacher._id,
        firstName : teacher.firstName,
        lastName : teacher.lastName,
        email : user.email,
    }

    if (teacher && user) return res.sendJson(200, payload);
    else APIError({status : 500, message : "Internal Server error."})
}

exports.update = async (req, res, next) => {

    const teacherInfo = await TEACHER.findOne({ _id: req.params.id, isDeleted: false });

    if (JSON.stringify(req.user._id) !== (JSON.stringify(teacherInfo.user)))
        throw new APIError({ status: 403, message: "You can't change someone else's details." });

    let payload = req.body;
    let userInfo = {};

    if (payload.hasOwnProperty('email')) {
        userInfo.email = payload.email;
        delete payload['email'];
    }
    if (payload.hasOwnProperty('password')) {
        userInfo.password = payload.password;
        delete payload['password'];
    }
    let user;
    const teacher = await TEACHER.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: { ...payload } }, { new: true })
    
    if (Object.keys(userInfo).length !== 0)
        user = await USER.findOneAndUpdate({ _id: teacher.user, isDeleted: false }, { $set: { ...userInfo } }, { new: true });

    res.sendJson(200, "Teacher updated Successfully..");
}

exports.delete = async (req, res, next) => {

 
    const teacherInfo = await TEACHER.findOne({ _id: req.params.id, isDeleted: false });

    if (req.user._id == teacherInfo.user || req.user.role === 'admin') {
    
        const teacher = await TEACHER.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
        await USER.findOneAndUpdate({ _id: teacher.user, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
        res.sendJson(200, "Teacher deleted Successfully.")
    }
    else throw new APIError({ status: 403, message: "You can't delete someone else's details." });
}

exports.findOne = async (req, res, next) => {
    
    const teacher = await TEACHER
        .findOne({ _id: req.params.id, isDeleted: false })
        .populate({ path: 'user', select: { email: 1, _id: 0 } })
        .populate({ path: 'coursesCreated', match: { isDeleted: false }, select : 'name price' });

    return res.sendJson(200, removeFields(toObject(teacher)));
}

exports.findAll = async (req, res, next) => {

    const teacher = await TEACHER
        .find({ isDeleted: false }, { isDeleted: 0, createdAt: 0, updatedAt: 0 })
        .populate({ path: 'user', select: { email: 1, _id: 0 } })
        .populate({ path: 'coursesEnrolled', match: { isDeleted: false }, select : 'name price' });

    if (teacher)
        return res.sendJson(200, teacher);
    else
        throw new APIError({ status: 400, message: "No students are left." })
}