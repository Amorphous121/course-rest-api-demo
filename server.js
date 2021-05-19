require('express-async-errors');
require('dotenv').config();
const path = require('path');
const logger = require('morgan');
const express = require('express')
const Database = require('./middlwares/database-mid');
const error = require('./middlwares/error-mid');
const Routes = require('./routes/');
const { sendJson } = require('./middlwares/generateResponse-mid');

const app = express()
app.response.sendJson = sendJson;

const port = process.env.PORT || 8081;
Database.connect();
app.use(express.json());
app.use(express.urlencoded({extended : true }));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs')    
app.use(logger('dev'));
app.use('/', Routes);
app.use(error.converter);
app.use(error.notFound);
app.use(error.handler);


app.listen(port, () => console.log(`-------------> Server is up and running at ${port} <------------- `));