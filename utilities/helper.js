const jwt = require('jsonwebtoken');

const { appSecrets } = require('../config');


exports.toObject = json => JSON.parse(JSON.stringify(json));

exports.generateJWT = obj => jwt.sign(obj, appSecrets.jwt);


exports.removeFields = (obj, keys, defaultFields = true) => {

    let basicFields = ['createdAt', 'deletedAt', 'updatedAt', 'isDeleted', 'deletedBy'];
    keys = (typeof keys == 'string') ? [keys] : keys || [];
   
    if (defaultFields)
        keys = keys.concat(basicFields);

    keys.forEach(key => delete obj[key]);
    return obj;
}

exports.dayDiff = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));
