const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name : { type : String, required : true}
}, { varsionKey : false, timestamps : true });

module.exports = mongoose.model('role', RoleSchema, 'roles');