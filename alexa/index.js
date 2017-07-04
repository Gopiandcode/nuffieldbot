'use strict';


var express       = require('express');
var https         = require('https');
var http          = require('http');
var fs            = require('fs');
var bodyParser    = require('body-parser');
var context       = require('aws-lambda-mock-context');
var createHandler = require('azure-function-express').createHandler;


var lambda      = require('./lib/alexa.js');

const SERVER_PORT = 3000;
const SERVER_IP = 'localhost';
const REST_PORT = 3000;

// Credentials - used initially for testing purposes
// var privatekey = fs.readFileSync('./secret/key.pem');
// var certificate = fs.readFileSync('./secret/cert.pem'); 
// var credentials = {key: privatekey, cert: certificate};

var app = express();

/*app.use(function(req, res, next) {
    console.log(req);
    next();
});*/


app.use(bodyParser.json({ type: 'application/json' }));

app.post('/api/alexa/', function(req, res) {
    var ctx = context();
    req.context.log(req.body);
    lambda.handler(req.body, ctx);
    ctx.Promise.then(resp => { return res.status(200).json(resp);})
        .catch(err => {console.log(err); });
});

// app.get('/', function(req, res) {
//     console.log("get request recieved");
// });

// var httpsServer = https.createServer(credentials, app);
// var httpServer = http.createServer(app);

    
module.exports = createHandler(app);
