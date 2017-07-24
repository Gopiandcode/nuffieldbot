const data_utilities = require('./data_utilities.js');
const request = require('request');
const urls = require('../data/urls.js');

let local_db = {};

module.exports = {
    'generate_available_intent': generate_available_intent,
    'generate_active_intent': generate_active_intent,
    'generate_prior_intents': generate_prior_intents,
    'is_valid_available_class': is_valid_available_class,
    'is_valid_active_booking': is_valid_active_booking,
    'is_valid_past_booking': is_valid_past_booking,
    'generate_makebookingconfirm_help_response': generate_makebookingconfirm_help_response,
    'make_booking': make_booking,
    'cancel_booking': cancel_booking,
    'give_feedback': give_feedback,
    'populate_database': populate_database
};


function generate_available_intent(class_type, date, time, attributes, callback) {

    // Parse the input dates.
    let booking_dates = date ? data_utilities.convertDateSlotValue(date.value) : {
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7)
    };
    let converted_class = data_utilities.convertAlexaSpeach(class_type.value);

    // Retrieve the pre-generated data.
    let event_mapping = local_db[attributes.token];
    event_mapping = JSON.parse(event_mapping);

    // Retrieve the ID for the class type
    let id = undefined;
    for (let i in event_mapping) {
        if (event_mapping.hasOwnProperty(i)) {
            if (event_mapping[i].alexa_name === converted_class) {
                id = event_mapping[i].id;
                break;
            }
        }
    }

    // Form the url to access the api
    let options = urls.options_event_request;
    options.url = urls.retrieve_events_url(booking_dates, id);

    // Add the authentication header
    options.headers['auth-token'] = attributes.auth_token;


    request(options, function (error, resp, body) {

        let data = JSON.parse(body);
        let request_count = 0;
        let request_limit = data._embedded.events.length;

        if (request_limit === 0) {
            let none_found = "There are no " + converted_class + " classes available during that time.";
            callback({cmd: ':tell', data: none_found});
        }
        else
            data._embedded.events.forEach(function (obj) {
                let uri = obj._links.event_group.href;
                //uri = uri.substring(0, uri.lastIndexOf('{'));

                let second_options = urls.options_event_request;
                second_options.url = decodeURI(uri);
                second_options.headers['auth-token'] = attributes.auth_token;

                request(second_options, (error, resu, dat) => {

                    obj.description = JSON.parse(dat).name;
                    request_count++;

                    if (request_count >= request_limit) {
                        let response = data_utilities.speachify(data);
                        let speach = "Here are some available classes around that time. " + response + ". Would you like to make a booking?";
                        callback({cmd: ':ask', data: speach});

                    }

                });
            });
    });

}


/* Functions used to generate text responses when the content may change */
function generate_active_intent(attributes, callback) {
    let items = "";

    //TODO: Get Active bookings for user

    callback({cmd: ':ask', data: "Your active bookings are " + items + ". Would you like to cancel a booking?"});
}


function generate_prior_intents(class_type, date, attributes, callback) {
    let items = "";

    // TOOD: Get prior classes for user.


    callback({cmd: ':ask', data: "Your previous classes are " + items + ". Would you like to give feedback?"});
}


function is_valid_available_class(class_type, datestring, timestring, attributes, callback) {
    let converted_class = data_utilities.convertAlexaSpeach(class_type.value);
    let date = data_utilities.convertDateSlotValue(datestring.value);
    date = data_utilities.addTimeToDateRange(timestring.value, date);


    let event_mapping = local_db[attributes.token];
    event_mapping = JSON.parse(event_mapping);

    let id = undefined;
    for (let i in event_mapping) {
        if (event_mapping.hasOwnProperty(i))
            if (event_mapping[i].alexa_name === converted_class) {
                id = event_mapping[i].id;
                break;
            }
    }

    if (!id) {
        callback(false);
        return;
    }

    let options = urls.options_event_request;
    options.url = urls.retrieve_events_url(date, id);
    options.headers['auth-token'] = attributes.auth_token;

    request(options, function (err, resp, body) {
        let data = JSON.parse(body);
        if (Number(data.total_entries) !== 0) {
            callback(true);
        } else {
            callback(false);
        }
    });

}

function is_valid_active_booking(class_type, datestring, timestring, attributes, callback) {
    // TODO: Implement functionality to check whether a booking to be canceled exists on the account or not.
    callback(true);
}


function is_valid_past_booking(class_type, date, time, attributes, callback) {
    callback(true);
}

function generate_makebookingconfirm_help_response(activity, date, time, attributes, callback) {
    // TOOD: find  way to stringify slot values from alexa
    //return "Would you like to book " + activity + " on " + date + " at " + time;
    callback({cmd: ':ask', data: "Would you like to book an activity at a date on a time?"});
}

function make_booking(activity, date, time, attributes, callback) {
    // TODO: Implement function to make a booking given an activity a date and time
    callback(true);
}

function cancel_booking(activity, date, time, attributes, callback) {
    // TODO: Implement function to cancel a booking given a date and time
    callback(true);
}

function give_feedback(activity, date, time, score, attributes, callback) {
    callback(true);
}

function populate_database(events, attributes) {

    data_utilities.buildEventGroupDatabase(events, attributes, (data) => {
        // Take the parsed data and store it in the local database under the user's id
        local_db[attributes.token] = data;
    });

}