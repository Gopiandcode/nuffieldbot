const Alexa = require('alexa-sdk');
const request = require('request');
const auth = require('./data/urls.js');
const sayings = require('./data/sayings.js');
const api_wrapper = require('./utility/api_wrapper');
const handler_ = require('./states');

const debug = false;




/* State and state related handling */

let states = handler_.states;




// Deals with initializing the state when there is no state then forwards the request.
var newsession_handlers = handler_.new_session_handlers;

// If unauthenticated exit skill irrespective of requested intent - without home gym no info can be provided.
var unauthenticated_handlers = Alexa.CreateStateHandler(states.UNAUTHENTICATED, handler_.unauthenticated_handers);

// From the root location, access all sub trees.
var root_handlers = Alexa.CreateStateHandler(states.ROOT, handler_.base_handlers);

var makebooking_handlers = Alexa.CreateStateHandler(states.MAKEBOOKING, handler_.makebooking_handlers);


var makebookingconfirm_handler = Alexa.CreateStateHandler(states.MAKEBOOKINGCONFIRM, handler_.makebookingconfirm_handlers);

var cancelbookingbegin_handler = Alexa.CreateStateHandler(states.CANCELBOOKINGBEGIN, handler_.cancelbookingbegin_handler);

var viewmoreinformation_handler = Alexa.CreateStateHandler(states.VIEWMOREINFORMATION, handler_.viewmoreinformation_handler);

var listprior_handler = Alexa.CreateStateHandler(states.LISTPRIOR, handler_.listprior_handler);

module.exports.handler = function (event, context, callback, logging_function) {

    let appId = process.env.APPLICATION_ID;

    // Authenticate user using token from Microsoft ADBC

    let token = event.session.user.accessToken;


    if (token || debug) {
        // TODO: Implement token validation and use

        // Get booking_bug authentication token.

        // As the session can not be accessed after sending a response,
        // the application will assign each user a UUID in their session
        // which they can then use to retrieve the results of any expensive computations.

        let user_uuid;

        // Store User details in the session.
        if (event.session.attributes) {
            event.session.attributes["authenticated"] = true;
            event.session.attributes["user_id"] = event.session.user.userId;
            event.session.attributes['log'] = logging_function;
        } else {
            event.session.attributes = {
                authenticated: true,
                user_id: event.session.user.userId,
                log: logging_function
            };
        }

        // Store the token in the attributes.
        if (!event.session.attributes.token) {
            event.session.attributes['token'] = token;
        } else {
            token = event.session.attributes['token'];
        }


        // Send off a request to retrieve data for the user.
        request(auth.options_token_request, function (error, resp, data) {
            if (error) throw new Error(error);

            event.session.attributes['auth_token'] = JSON.parse(data).auth_token;

            // Here we send a request to retrieve the list of event_groups, and once recieved store it in a global db under the users id
            let event_group_request = auth.event_group_request;
            event_group_request.headers['auth-token'] = event.session.attributes['auth_token'];


            request(event_group_request, function (error, resp, data) {
                let values = JSON.parse(data);
                let events = values._embedded.event_groups;
                api_wrapper.populate_database(events, event.session.attributes);
            });

            let alexa = Alexa.handler(event, context);
            alexa.appId = appId;
            alexa.registerHandlers(root_handlers, unauthenticated_handlers, newsession_handlers, makebooking_handlers, makebookingconfirm_handler, cancelbookingbegin_handler, viewmoreinformation_handler, listprior_handler);
            alexa.execute();

        });

    } else {

        if (event.session.attributes) {
            event.session.attributes["authenticated"] = false;
        } else {
            event.session.attributes = {
                authenticated: false,
            };
        }
        let alexa = Alexa.handler(event, context);
        alexa.appId = appId;
        alexa.registerHandlers(root_handlers, unauthenticated_handlers, newsession_handlers, makebooking_handlers, makebookingconfirm_handler, cancelbookingbegin_handler, viewmoreinformation_handler, listprior_handler);
        alexa.execute();
    }


};

