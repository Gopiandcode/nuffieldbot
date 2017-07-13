var Alexa = require('alexa-sdk');
const request = require('request');
const debug = false;
const booking_bug = require('./booking_bug.js');
const auth = require('./auth.js');
const uuidv1 = require('uuid/v1');
var local_db = {};

/* All static text prompts said by Alexa - used in their respective intent */
const launch_request_response = "Welcome to Nuffield Health. you can make a new booking or cancel your current bookings. I can also tell you more information about the gym classes. What would you like to do?";
const view_more_information_response = "Sure. I can list out available bookings, your prior bookings or your currently active bookings. What would you like to hear?";
const make_booking_response = 'Great, there is a booking for you, shall I make it?';
const cancel_booking_begin = "In that case, what booking would you like to cancel? - I can list out your active bookings if you want.";

const make_booking_not_found_response = "Unfortunately there aren't any bookings at that time";
const invalid_booking_cancel_booking_response = "You don't have a class booked at that time, so I couldn't cancel anything.";
const invalid_request_root_response = "I'm sorry, I didn't quite catch that. You can make or cancel a booking. and I can also give you more information about the classes.";
const unauthenticated_client_response = "To use the Nuffield Health skill please link the skill to your Nuffield Gym Account. Check the Alexa app for more information.";
const not_found_give_feedback_response = "Sorry, I couldn't find an activity by those details in your history. If you've forgotten the details I can list out your prior bookings.";
const unhandled_request_make_booking_response = "I didn't quite understand what you meant. I can help you make a booking - to begin just tell me what booking you would like to make.";


const confirmation_denied_make_booking_response = "Okay, I won't book it.";
const confirmation_denied_cancel_booking_response = "Sure, I won't cancel anything. Thanks for using Nuffield Health.";
const confirmation_denied_give_feedback_response = "Sure. No feedback was sent. Thanks for using Nuffield Health";


const help_request_view_information_response = "I can give you more information about classes, such as which bookings you have active, your booking history or which classes are available";
const help_request_list_prior_response = "You can leave a score out of 10 for a class you attended. Tell me the date and time of the class to get started. If you would like a reminder, I can list out your past bookings.";
const help_request_cancel_booking_begin_response = "I can help you cancel a booking. To begin, tell me which activity you would like to cancel and what date it is on. If you can't remember, I can list out your active bookings.";
const help_request_makebooking_response = "I can help you make a booking for a class. Just give me a date around which you'd like the class";
const help_request_root_response = "You can use the Nuffield Health skill to change your bookings, or to view information about classes.";


const confirm_give_feedback_response = "Great, I have sent your feedback about the class back to Nuffield Health.";
const confirm_canceled_booking_response = "Sure, I have cancelled your booking. Check the amazon app for more information";
const end_session_root_response = "Goodbye, Thanks for using Nuffield Health";




/* Functions used to generate text responses when the content may change */
function generate_active_intent() {
    var items = "";

    //TODO: Get Active bookings for user

    return "Your active bookings are " + items + ". Would you like to cancel a booking?";
}

function generate_available_intent(class_type, date, time, attributes, callback) {
    var items = "";

    var class_id = undefined//class_type ? booking_bug.convertSkillValue(class_type) : undefined;
        attributes.log("----------------------------------------------------------------\nRecieved Class: " + class_type);
    attributes.log("----------------------------------------------------------------\nRecieved date: " + date);
    var booking_dates = date ? booking_bug.convertDateSlotValue(date) : {startDate: new Date(), endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7)};
    
    
    var converted_class = booking_bug.convertAlexaSpeach(class_type);
    attributes.log('these are the attributed uuids');
    attributes.log(attributes);
    attributes.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    attributes.log(local_db);
    var data = local_db[attributes.token];
    data = JSON.parse(data);
    var id = undefined;
    for(var i in data) {
        attributes.log('checking (' + data[i].alexa_name + ' <==> ' + converted_class + ')')
        if(data[i].alexa_name === converted_class) {
            id = data[i].id;
            break;
        }
    }
    
    //var booking_time = booking_bug.convertTimeSlotValue(time);
    //var booking_date = booking_date_partial;//.setTime(booking_time.getTime());

    // TODO: Get Available classes for user

    var options = auth.options_event_request;
    options.url = 'https://nuffield-uat.bookingbug.com/api/v1/37059/events?start_date='+ booking_dates.startDate.toISOString() + '&end_date=' + booking_dates.endDate.toISOString() + '&per_page=2&include_non_bookable=false'
    
    if(id) {
        options.url += "&event_group_id=" + id;
    }
    
    attributes.log("----------------------------------------------------------------\nUrl Requested: " + options.url);
    options.headers['auth-token'] = attributes.auth_token;
    request(options, function(error, resp, body) {
            attributes.log(body);
            var data = JSON.parse(body);
            var request_count = 0;
            var request_limit = data._embedded.events.length;
            if(request_limit === 0) {
                                        var none_found = "Unfortunately there are no " + converted_class + " classes available during that time.";
                                        callback({cmd: ':tell', data: none_found});
            }
            else 
            data._embedded.events.forEach(function(obj) {
                var uri = obj._links.event_group.href;
                //uri = uri.substring(0, uri.lastIndexOf('{'));
                attributes.log('raw: ' + obj._links.self.href);
                var second_options = auth.options_event_request;
                second_options.url = decodeURI(uri);
                attributes.log('decoded: ' + decodeURI(uri));
                second_options.headers['auth-token'] = attributes.auth_token;
                
                
                request(second_options, (error, resu, dat) => {
                    attributes.log('---------------------------------------------------------\n');
                    attributes.log('----------------------data  response---------------------\n');
                    attributes.log('---------------------------------------------------------\n');                    
                    attributes.log(dat);
                    var group_name = JSON.parse(dat).name;
                    attributes.log(request_count + "th item: " + group_name);
                    obj.description = group_name;
                    request_count++;
                    
                    if(request_count >= request_limit) {
                        var response = booking_bug.speachify(data);
                        var speach = "Here are some available classes around that time. " + response + ". Would you like to make a booking?";
                        callback({cmd: ':ask', data: speach});

                    }
                    
                });
                
                
                
            });
            

    });
    
    
}

function generate_prior_intents(class_type, date) {
    var items = "";

    // TOOD: Get prior classes for user.
    return "Your previous classes are " + items + ". Would you like to give feedback?";
}

function isValidAvailableClass(class_type, datestring, timestring, attributes, callback) {
    attributes.log("Checking whether " + JSON.stringify(class_type) + " on " + JSON.stringify(datestring) + " at " + JSON.stringify(timestring) + " is valid");
    var converted_class = booking_bug.convertAlexaSpeach(class_type.value);
    var date = booking_bug.convertDateSlotValue(datestring.value).startDate;
    date = booking_bug.convertTimeSlotValueAlt(timestring.value, date);
    attributes.log("Converted date is " + date.toISOString() + "  and the class is " + converted_class);
    
    
    var data = local_db[attributes.token];
    data = JSON.parse(data);
    
    var id = undefined;
    
    for(var i in data) {
        attributes.log('checking (' + data[i].alexa_name + ' <==> ' + converted_class + ')')
        if(data[i].alexa_name === converted_class) {
            id = data[i].id;
            break;
        }
    }    
    if(!id) {
        callback(false);
        return;
    }
    
    var options = auth.options_event_request;
    options.url = "https://nuffield-uat.bookingbug.com/api/v1/37059/events?start_date=" + date.toISOString() + "&per_page=1&include_non_bookable=false&event_group_id=" + id;
    options.headers['auth-token'] = attributes.auth_token;
    
    request(options, function(err, resp, body) {
        attributes.log("????????????????????????????????\n Reciveved" + body);
        var evs = JSON.parse(body);
        if(Number(evs.total_entries) !== 0) {
            callback(true);
            return;
        } else {
            callback(false);
            return;
        }
    });
    
    
    
    
    // TODO: Implement functionality to check whether a booking to be made is available or not.
}

function isValidActiveBooking(class_type, date, time) {
    // TODO: Implement functionality to check whether a booking to be canceled exists on the account or not.
    return true;
}

function isValidPastBooking(class_type, date, time) {
    return true;
}

function generate_makebookingconfirm_help_response(activity, date, time) {
    // TOOD: find  way to stringify slot values from alexa
    //return "Would you like to book " + activity + " on " + date + " at " + time;
    return "Would you like to book an activity at a date on a time?"
}

function make_booking(activity, date, time) {
    // TODO: Implement function to make a booking given an activity a date and time
}

function cancel_booking(activity, date, time) {
    // TODO: Implement function to cancel a booking given a date and time
}
function give_feedback(activity, date, time, score) {

}


function authentication_state_wrapper(state) {
    return function () {
        console.log("_----------------------------------------------------------------");
        console.log("Wrapper function being called with state " + this.handler.state);
        if (this.attributes.authenticated || debug) {
            this.handler.state = states.ROOT;
            this.emitWithState(state);
        } else {
            this.handler.state = states.UNAUTHENTICATED;
            this.emitWithState(state);
        }
    };
}


/* State and state related handling */

var states = {
    ROOT: '_ROOT',
    MAKEBOOKING: '_MAKEBOOKING',
    MAKEBOOKINGCONFIRM: '_MAKEBOOKINGCONFIRM',
    CANCELBOOKINGBEGIN: '_CANCELBOOKINGBEGIN',
    VIEWMOREINFORMATION: '_VIEWMOREINFORMATION',
    LISTPRIOR: '_LISTPRIOR',
    UNAUTHENTICATED: '_UNAUTHENTICATED'
};


var handlers = {
    'LaunchRequest': function () {
        console.log('LaunchRequest recieved');
        this.emit(':ask', launch_request_response);

    },
    'CancelBookingIntent': function () {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            console.log('root: CancelBookingIntent recieved');
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;

            console.log(date);
            console.log(time);
            console.log(activity);
            console.log();

            // check if user wants to cancel his booking.
            if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {

                if (isValidActiveBooking(activity, date, time)) {
                    cancel_booking(activity, date, time);
                    this.emit(':tell', confirm_canceled_booking_response);
                } else {
                    this.emit(":tell", invalid_booking_cancel_booking_response);
                }

            } else {

                this.emit(':tell', confirmation_denied_cancel_booking_response);

            }

        }
    },
    'CancelBookingBeginIntent': function () {
        console.log('Root: CancelBookingBeginIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', cancel_booking_begin);
    },
    'GiveFeedbackIntent': function () {
        console.log('GiveFeedbackIntent recieved');

        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;
            var score = this.event.request.intent.slots.score;
            console.log(date);
            console.log(time);
            console.log(activity);
            console.log(score);
            if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                if (isValidPastBooking(activity, date, time)) {
                    give_feedback(activity, date, time, score);
                    this.emit(":tell", confirm_give_feedback_response);
                } else {
                    this.handler.state = states.LISTPRIOR;
                    this.emitWithState(":ask", not_found_give_feedback_response);
                }
            } else {
                this.emit(":tell", confirmation_denied_give_feedback_response)
            }
        }
    },
    'ListActiveIntent': function () {
        console.log('ListActiveIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', generate_active_intent());
    },
    'ListAvailableIntent': function () {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            console.log('ListActiveIntent recieved');
            var date = this.event.request.intent.slots.date.value;
            var activity = this.event.request.intent.slots.activity.value;
            console.log(date);
            console.log(activity);
            console.log('ListAvailableIntent recieved');
            this.handler.state = states.MAKEBOOKING;
            generate_available_intent(activity, date, undefined, this.attributes, (data) => {
                this.emit(data.cmd, data.data);
            });
        }
    },
    'ListPriorIntent': function () {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;


        console.log(date);
        console.log(activity);


        this.handler.state = states.LISTPRIOR;
        this.emit(':ask', generate_prior_intents(activity, date));
    },
    'SelectBookingIntent': function () {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            console.log('SelectBookingIntent recieved');
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;
            console.log(date);
            console.log(time);
            console.log(activity);
            this.attributes['params'] = {
                date: date,
                time: time,
                activity: activity
            };
            //
            // TODO: Use the parameters returned to find available bookings.
            isValidAvailableClass(activity, date, time, this.attributes, (validity) => {
                
                
                 if (validity) {
                    this.handler.state = states.MAKEBOOKINGCONFIRM;
                    this.emit(':ask', make_booking_response);
                } else {
                    this.handler.state = states.MAKEBOOKING;
                    generate_available_intent(activity, date.value, time.value, this.attributes, (data) => {
                    this.emit(data.cmd, make_booking_not_found_response + data.data);
                  });
                }
            
            });
        }
    },
    'ViewMoreInformationIntent': function () {
        console.log('ViewMoreInformationIntent recieved');
        this.handler.state = states.VIEWMOREINFORMATION;
        this.emit(':ask', view_more_information_response);
    },
    'AMAZON.HelpIntent': function () {
        console.log("Help Intent recieved");

        this.emit(':ask', help_request_root_response);
    },
    'AMAZON.CancelIntent': function () {
        console.log("Cancel Intent recieved");
        this.emit(':tell', end_session_root_response);
    },
    'AMAZON.StopIntent': function () {
        console.log("Stop Intent recieved");
        this.emit(':tell', end_session_root_response);
    },
    'Unhandled': function () {
        console.log("Unhandled intent recieved");

        this.emit(':ask', invalid_request_root_response);
    }
};

// Deals with initializing the state when there is no state then forwards the request.
var newsession_handlers = {
    'LaunchRequest': authentication_state_wrapper('LaunchRequest'),
    'CancelBookingIntent': authentication_state_wrapper('CancelBookingIntent'),
    'CancelBookingBeginIntent': authentication_state_wrapper('CancelBookingBeginIntent'),
    'GiveFeedbackIntent': authentication_state_wrapper('GiveFeedbackIntent'),
    'ListActiveIntent': authentication_state_wrapper('ListActiveIntent'),
    'ListAvailableIntent': authentication_state_wrapper('ListAvailableIntent'),
    'ListPriorIntent': authentication_state_wrapper('ListPriorIntent'),
    'SelectBookingIntent': authentication_state_wrapper('SelectBookingIntent'),
    'ViewMoreInformationIntent': authentication_state_wrapper('ViewMoreInformationIntent'),
    'Unhandled': authentication_state_wrapper('Unhandled'),
    'AMAZON.CancelIntent': function () {
        console.log("Cancel Intent recieved");
        this.emit(':tell', end_session_root_response);
    },
    'AMAZON.StopIntent': function () {
        console.log("Stop Intent recieved");
        this.emit(':tell', end_session_root_response);
    }
};

// If unauthenticated exit skill irrespective of requested intent - without home gym no info can be provided.
var unauthenticated_handlers = Alexa.CreateStateHandler(states.UNAUTHENTICATED, {
    'Unhandled': function () {
        this.emit(':tell', unauthenticated_client_response);
    }
});

// From the root location, access all sub trees.
var root_handlers = Alexa.CreateStateHandler(states.ROOT, handlers);

var makebooking_handlers = Alexa.CreateStateHandler(states.MAKEBOOKING, {

    'SelectBookingIntent': function () {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            console.log('SelectBookingIntent recieved');
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;
            console.log(date);
            console.log(time);
            console.log(activity);
            this.attributes['params'] = {
                date: date,
                time: time,
                activity: activity
            };
            //
            // TODO: Use the parameters returned to find available bookings.
            isValidAvailableClass(activity, date, time, this.attributes, (validity) => {
            if(validity) {
                this.handler.state = states.MAKEBOOKINGCONFIRM;
                this.emit(':ask', make_booking_response);
            } else {
                this.handler.state = states.MAKEBOOKING;
                generate_available_intent(activity, date.value, time.value, this.attributes, (data) => {
                    this.emit(data.cmd, make_booking_not_found_response + data.data);
                  });
                }
            });
        }
    },

    'AMAZON.HelpIntent': function () {
        console.log("makebooking: helpintent recieved");

        this.emit(':ask', help_request_makebooking_response);


    },

    'CustomYesIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },

    'CustomNoIntent': function () {
        this.attributes.log("ending requst ?");
        this.shouldEndSession = true;
    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.PreviousIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },
    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function () {
        this.emit(':tell', unhandled_request_make_booking_response);
    }
});


var makebookingconfirm_handler = Alexa.CreateStateHandler(states.MAKEBOOKINGCONFIRM, {
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("makebookingconfirm: help request");
        var date = this.attributes["params"].date;
        var time = this.attributes["params"].time;
        var activity = this.attributes["params"].activity;
        this.emit(':ask', generate_makebookingconfirm_help_response(activity, date, time));
    },

    'CustomYesIntent': function () {
        console.log("makebookingconfirm: yes request");

        var date = this.attributes["params"].date;
        var time = this.attributes["params"].time;
        var activity = this.attributes["params"].activity;

        make_booking(activity, date, time);

        this.emit(':tell', "Okay sure, I have made the booking. Check the amazon app for more information");

    },
    'CustomNoIntent': function () {
        console.log("makebookingconfirm: no intent");
        this.emit(':tell', confirmation_denied_make_booking_response);
    },

    'AMAZON.PreviousIntent': function () {
        this.handler.state = states.MAKEBOOKING;
        this.emitWithState("SelectBookingIntent")
    },
    'AMAZON.RepeatIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },


    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function () {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

var cancelbookingbegin_handler = Alexa.CreateStateHandler(states.CANCELBOOKINGBEGIN, {
    'CancelBookingIntent': function () {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            console.log('Cancelbookingbegin: CancelBookingIntent recieved');
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;

            console.log(date);
            console.log(time);
            console.log(activity);
            console.log(this.event.request.intent);


            if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {

                if (isValidActiveBooking(activity, date, time)) {
                    cancel_booking(activity, date, time);
                    this.emit(':tell', confirm_canceled_booking_response);
                } else {
                    this.emit(":tell", invalid_booking_cancel_booking_response);
                }

            } else {

                this.emit(':tell', confirmation_denied_cancel_booking_response);

            }

        }
    },
    'ListActiveIntent': function () {
        console.log('ListActiveIntent recieved');
        this.emit(':ask', generate_active_intent());
    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("cancelbookingbegin: helpintent");
        this.emit(':ask', help_request_cancel_booking_begin_response)
    },

    'AMAZON.PreviousIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },

    'CustomYesIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },

    'CustomNoIntent': function () {
        this.emit(':tell', confirmation_denied_cancel_booking_response);
    },


    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function () {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

var viewmoreinformation_handler = Alexa.CreateStateHandler(states.VIEWMOREINFORMATION, {
    'ListActiveIntent': function () {
        console.log('ListActiveIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', generate_active_intent());
    },
    'ListAvailableIntent': function () {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            console.log('ListActiveIntent recieved');
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;
            console.log(date);
            console.log(time);
            console.log(activity);
            console.log('ListAvailableIntent recieved');
            this.handler.state = states.MAKEBOOKING;
            generate_active_intent(activity, date, time, this.attributes, function(data) {
                
                this.emit(':ask', data);
            });
        }
    },
    'ListPriorIntent': function () {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;


        console.log(date);
        console.log(activity);


        this.handler.state = states.LISTPRIOR;
        this.emit(':ask', generate_prior_intents(activity, date));
    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("viewmoreinformation: helpintent");
        this.emit(':ask', help_request_view_information_response);
    },


    'AMAZON.PreviousIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },


    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function () {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

var listprior_handler = Alexa.CreateStateHandler(states.LISTPRIOR, {
    'ListPriorIntent': function () {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;
        console.log(date);
        console.log(activity);
        this.emit(':ask', generate_prior_intents(activity, date));
    },
    'GiveFeedbackIntent': function () {
        console.log('GiveFeedbackIntent recieved');

        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS") {
            this.context.succeed({
                "response": {
                    "directives": [
                        {
                            "type": "Dialog.Delegate"
                        }
                    ],
                    "shouldEndSession": false
                },
                "sessionAttributes": {}
            });
        } else {
            var date = this.event.request.intent.slots.date;
            var time = this.event.request.intent.slots.time;
            var activity = this.event.request.intent.slots.activity;
            var score = this.event.request.intent.slots.score;
            console.log(date);
            console.log(time);
            console.log(activity);
            console.log(score);
            if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                if (isValidPastBooking(activity, date, time)) {
                    give_feedback(activity, date, time, score);
                    this.emit(":tell", confirm_give_feedback_response);
                } else {
                    this.emit(":ask", not_found_give_feedback_response);
                }
            } else {
                this.emit(":tell", confirmation_denied_give_feedback_response);
            }


        }

    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("listprior: help intent");
        this.emit(':ask', help_request_list_prior_response);
    },

    'CustomYesIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },
    'CustomNoIntent': function () {
        this.shouldEndSession = true;
    },

    'AMAZON.PreviousIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function () {
        this.emitWithState("AMAZON.HelpIntent");
    },


    'AMAZON.StartOverIntent': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function () {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function () {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

module.exports.handler = function (event, context, callback, logging_function) {

    var appId = process.env.APPLICATION_ID;

    // Authenticate user using token from Microsoft ADBC

    var token = event.session.user.accessToken;


    if (token || debug) {
        // TODO: Implement token validation and use

        // Get booking_bug authentication token.

        // As the session can not be accessed after sending a response,
        // the application will assign each user a UUID in their session
        // which they can then use to retrieve the results of any expensive computations.

        var user_uuid;

        if (event.session.attributes) {
            event.session.attributes["authenticated"] = true;
            event.session.attributes["user_id"] = event.session.user.userId;
            event.session.attributes['log'] = logging_function;
        } else {
            event.session.attributes = {
                authenticated: true,
                user_id: event.session.user.accessToken.userId,
                log: logging_function
            };
        }
        if(!event.session.attributes.uuid) {
            user_uuid = uuidv1(); 
            event.session.attributes.uuid = user_uuid;
        } else {
            user_uuid = event.session.attributes.uuid;
        }
        if(!event.session.attributes.token) {
            event.session.attributes['token'] = token;
        } else {
            token = event.session.attributes['token'];
        }
        
        request(auth.options_token_request, function(error, resp, data) {
            if(error) throw new Error(error);

            event.session.attributes['auth_token'] = JSON.parse(data).auth_token;

            // Here we send a request to retrieve the list of event_groups, and once recieved store it in a global db under the users id
            var event_group_request = auth.event_group_request;
            event_group_request.headers['auth-token'] = event.session.attributes['auth_token'];
            request(event_group_request, function(error, resp, data) {
                logging_function('--------------------------------------------------------------------');
                logging_function('recieevd a response');
                logging_function('--------------------------------------------------------------------');
                var values = JSON.parse(data);
                var events = values._embedded.event_groups;
                logging_function('events length: ------------------------------------->' + events.length );
                booking_bug.buildEventGroupDatabase(events,logging_function, (data) => {
                    // Take the parsed data and store it in the local database under the user's id
                    local_db[token] = data;
                });
            });

            var alexa = Alexa.handler(event, context);
            alexa.appId = appId;
            alexa.registerHandlers(root_handlers, unauthenticated_handlers, newsession_handlers, makebooking_handlers, makebookingconfirm_handler, cancelbookingbegin_handler, viewmoreinformation_handler, listprior_handler);
            alexa.execute();

        });

    } else {
        // TODO: Implement sign in reminder card

        if (event.session.attributes) {
            event.session.attributes["authenticated"] = false;
        } else {
            event.session.attributes = {
                authenticated: false,
            };
        }
            var alexa = Alexa.handler(event, context);
            alexa.appId = appId;
            alexa.registerHandlers(root_handlers, unauthenticated_handlers, newsession_handlers, makebooking_handlers, makebookingconfirm_handler, cancelbookingbegin_handler, viewmoreinformation_handler, listprior_handler);
            alexa.execute();
    }



}

