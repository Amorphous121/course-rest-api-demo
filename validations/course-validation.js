const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const COURSE = require('../models/course-model');
const APIError = require('../utilities/APIError');

exports.create = { 
    body : Joi.object({
        name : Joi.string().min(3).max(50).trim().required(),
        price : Joi.number().required(),
    })
}

exports.findOne = {
    params : Joi.object({
        id : Joi.objectId().required()
    })
}

exports.update = {
    params : Joi.object({
        id : Joi.objectId().required()
    }),
    body : Joi.object({
        name        : Joi.string().min(3).max(50).trim(),
        price       : Joi.number(),
        createdBy   :  Joi.objectId()
    }).required().not({})   
}

exports.remove = {
    params : Joi.object({
        id : Joi.objectId().required()
    })
}

exports.isExists = async (req, res, next) => {
    const _id = req.params.id;
    const record = await COURSE.findOne({ _id , isDeleted : false });
    if (!record) 
        throw new APIError({ status : 404 , message : 'No course belongs to given id'});
    next();
}

exports.adminRevoke = {
    params : Joi.object({
        id : Joi.objectId().required()
    }),
    body : Joi.object({
        id : Joi.objectId().required()
    })
}