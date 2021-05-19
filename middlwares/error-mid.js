const { ValidationError } = require('express-validation');

const APIError = require('../utilities/APIError');

const getErrorMessage = (error) => {
    
    error = error.details;

    if (error.body)   return error.body[0].message;
    if (error.params) return error.params[0].message;
    if (error.query)  return error.query[0].message;
}

exports.handler = (err, req, res, next) => {
    let message = err.message || "Something went wrong. Please try again later.";
    if (!err.isPublic) {
        err.status = 500;
        err.message = "Something went wrong. Please try again later.";
    }

    if (process.env.NODE_ENV === 'developent') {
        if (err.stack)  console.log(err.stack)
        if (err.errors) console.log(err.errors)
    }

    return res.sendJson(err.status, message)
}

exports.converter = (err, req, res, next) => {
    
    let convertedErr = err;
    if (err instanceof ValidationError)
        convertedErr = new APIError({ status : 422, message : getErrorMessage(err)});
    else if (!(err instanceof APIError))
        convertedErr = new APIError({ status : err.status, message : err.message, stack : err.stack });
    return this.handler(convertedErr, req, res);
}

exports.notFound = (req, res, next) => {
    const err = new APIError({ status : 404, message : "Not found!"});
    return this.handler(err, req, res);

}