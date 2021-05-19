const mongoose = require('mongoose');
const consola = require('consola');

const { dbUri } = require('../config');

const options  = { 
    useCreateIndex : true, 
    useNewUrlParser : true, 
    useFindAndModify : false, 
    useUnifiedTopology : true 
}

const connect = async () => {

    mongoose.connect(dbUri, options)
        .then(() => console.log("-------------> Database Connected Succesfully   <------------- "))
        .catch((err) => {
            console.error(err.message);
            throw new Error("---------------- Problem while connecting database -------------");
        })
}

module.exports = {
    connect,
}