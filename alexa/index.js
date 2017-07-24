'use strict';


const express       = require('express');
const context       = require('aws-lambda-mock-context');
const createHandler = require('azure-function-express').createHandler;
const config        = require('./config/config');


const lambda      = require('./lib/alexa.js');

const SERVER_PORT = 3000;
const SERVER_IP = 'localhost';
const REST_PORT = 3000;



const app = express();

if(config.buildLocally) {
    // The Azure-Function-Express converter automatically adds session and body parsing,
    // as such when building locally, we have to supply the functionality ourselves.

    const session = require('express-session');
    const bodyParser    = require('body-parser');
    
    app.use(session({secret: 'NuffieldHealthBot',cookie:{}}));
    app.use(bodyParser.json({ type: 'application/json' }));

    // The Azure-Function-Express handler also provides access to Azure's Logging functions through
    // req.context.log, thus to prevent missing compatibilities, when building locally we redirect that to
    // console.log.
    app.use(function(req,res,next) {
        req.context = {
            log: console.log
        }
        next();
    });

    app.use(function(req, res, next) {
        req.context.log("[ALEXA_HANDLER]: Request Recieved:");
        req.context.log(JSON.stringify(req.body));

        next();
    });

}


app.post('/api/alexa/', function(req, res) {
    var ctx = context();

    lambda.handler(req.body, ctx, undefined,req.context.log);
    
    ctx.Promise.then((resp) => {
        return res.status(200).json(resp);
    }).catch(err => {
        req.context.log(err);
    });
});



if(config.buildLocally) {
    app.listen(SERVER_PORT);
} else {
    module.exports = createHandler(app);
}