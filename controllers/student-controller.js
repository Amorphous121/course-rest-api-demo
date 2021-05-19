const STUDENT = require('../models/student-model');
const COURSE = require('../models/course-model');
const ROLE = require('../models/role-model');
const USER = require('../models/user-model');

const APIError = require('../utilities/APIError');
const { removeFields, toObject } = require('../utilities/helper');

exports.create = async (req, res, next) => {

    let payload = req.body;
    const role = await ROLE.findOne({ name: 'student' });
    if (!role) throw new APIError({ status: 500, message: "System roles are not generated yet." })

    const user = await USER.create({
        email: payload.email,
        password: payload.password,
        role: role._id
    })

    const student = await STUDENT.create({
        firstName: payload.firstName,
        lastName: payload.lastName,
        user: user._id
    })

    payload = {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: user.email,
    }

    if (student && user) return res.sendJson(200, payload);
    else APIError({ status: 500, message: "Internal Server error." })
}


exports.findOne = async (req, res, next) => {

    const student = await STUDENT
        .findOne({ _id: req.params.id, isDeleted: false })
        .populate({ path: 'user', select: { email: 1, _id: 0 } })
        .populate({ path: 'coursesEnrolled', match: { isDeleted: false } });

    return res.sendJson(200, removeFields(toObject(student)));
}

exports.findAll = async (req, res, next) => {

    const student = await STUDENT
        .find({ isDeleted: false }, { isDeleted: 0, createdAt: 0, updatedAt: 0 })
        .populate({ path: 'user', select: { email: 1, _id: 0 } })
        .populate({ path: 'coursesEnrolled', match: { isDeleted: false } });

    if (student)
        return res.sendJson(200, student);
    else
        throw new APIError({ status: 400, message: "No students are left." })
}

exports.update = async (req, res, next) => {

    const studentInfo = await STUDENT.findOne({ _id: req.params.id, isDeleted: false });

    if (JSON.stringify(req.user._id) !== (JSON.stringify(studentInfo.user)))
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

    const student = await STUDENT.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: { ...payload } }, { new: true })
    let user;
    if (Object.keys(userInfo).length !== 0)
        user = await USER.findOneAndUpdate({ _id: student.user, isDeleted: false }, { $set: { ...userInfo } }, { new: true });

    res.sendJson(200, "Student updated Successfully..");
}

exports.delete = async (req, res, next) => {

    const studentInfo = await STUDENT.findOne({ _id: req.params.id, isDeleted: false });
    
    if (req.user._id === studentInfo.user  || req.user.role === 'admin') {
        const student = await STUDENT.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
        await USER.findOneAndUpdate({ _id: student.user, isDeleted: false }, { $set: { isDeleted: true } }, { new: true });
        res.sendJson(200, "Student deleted Successfully.")
    }
    else 
        throw new APIError({ status: 403, message: "You can't delete someone else's details." });

}

