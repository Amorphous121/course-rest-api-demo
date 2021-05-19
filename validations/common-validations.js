const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const APIError = require('../utilities/APIError');
const TEACHER = require('../models/teacher-model');
const STUDENT = require('../models/student-model');

exports.create = {
    body : Joi.object({
        firstName   : Joi.string().min(3).max(15).trim().required(),
        lastName    : Joi.string().min(3).max(15).trim().required(),
        email       : Joi.string().email().min(3).max(30).trim().lowercase().required(),
        password    : Joi.string().min(4).max(15).trim().required(),
    })
}

exports.findOne = {
    params : Joi.object({
        id : Joi.objectId().required(),
    })
}

exports.update = {  
    params : Joi.object({
        id : Joi.objectId().required(),
    }),
    body : Joi.object({
        firstName   : Joi.string().min(3).max(15).trim(),
        lastName    : Joi.string().min(3).max(15).trim(),
        email       : Joi.string().email().min(3).max(30).trim().lowercase(),
        password    : Joi.string().min(4).max(15).trim(),
    }).required().not({})
}

exports.remove = {
    params : Joi.object({
        id : Joi.objectId().required(),
    })
}

exports.isTeacherExists = async (req, res, next) => {
    let _id = req.params.id;
    const record = await TEACHER.findOne({ _id, isDeleted : false });
    if (!record) throw new APIError({ status : 404, message : "No teacher belongs to given id." });
    next();
}

exports.isStudentExists = async (req, res, next) => {
    let _id = req.params.id;
    const record = await STUDENT.findOne({ _id, isDeleted : false });
    if (!record) throw new APIError({ status : 404, message : "No student belongs to given id." });
    next();
}

