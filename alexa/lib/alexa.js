var Alexa = require('alexa-sdk');
var debug = true;


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

function generate_available_intent(class_type, date, time) {
    var items = "";

    // TODO: Get Available classes for user

    return "Here are some available classes around that time. " + items + ". Would you like to make a booking?";
}

function generate_prior_intents(class_type, date) {
    var items = "";

    // TOOD: Get prior classes for user.
    return "Your previous classes are " + items + ". Would you like to give feedback?";
}

function isValidAvailableClass(class_type, date, time) {
    // TODO: Implement functionality to check whether a booking to be made is available or not.
    return true;
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
    return function() {
        console.log("_----------------------------------------------------------------");
        console.log("Wrapper function being called with state " + this.handler.state);
        if(this.attributes.authenticated || debug) {
            this.handler.state = states.ROOT;
            this.emitWithState(state);
        } else {
            this.handler.state = states.UNAUTHENTICATED;
            this.emitWithState(state);
        }
    };
}


/* State and state related handling */

var states =  {
    ROOT               : '_ROOT',        
    MAKEBOOKING        : '_MAKEBOOKING',
    MAKEBOOKINGCONFIRM : '_MAKEBOOKINGCONFIRM',
    CANCELBOOKINGBEGIN : '_CANCELBOOKINGBEGIN',
    VIEWMOREINFORMATION: '_VIEWMOREINFORMATION',
    LISTPRIOR          : '_LISTPRIOR',
    UNAUTHENTICATED    : '_UNAUTHENTICATED'
};


var handlers = {
    'LaunchRequest': function() {
        console.log('LaunchRequest recieved');
        this.emit(':ask', launch_request_response);

    },
    'CancelBookingIntent': function() {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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
            if(this.event.request.intent.confirmationStatus === 'CONFIRMED') {

                if(isValidActiveBooking(activity, date, time)) {
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
    'CancelBookingBeginIntent' : function() {
        console.log('Root: CancelBookingBeginIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', cancel_booking_begin);
    },
    'GiveFeedbackIntent': function() {
        console.log('GiveFeedbackIntent recieved');

        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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
            if(this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                if(isValidPastBooking(activity, date, time)) {
                    give_feedback(activity, date, time, score);
                    this.emit(":tell", confirm_give_feedback_response);
                }  else {
                    this.handler.state = states.LISTPRIOR;
                    this.emitWithState(":ask", not_found_give_feedback_response);
                }
            } else {
                this.emit(":tell", confirmation_denied_give_feedback_response)
            }
        }
    },
    'ListActiveIntent': function() {
        console.log('ListActiveIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', generate_active_intent());
    },
    'ListAvailableIntent': function() {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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
            this.emit(':ask', generate_available_intent(activity, date, time));
        }
    },
    'ListPriorIntent': function() {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;


        console.log(date);
        console.log(activity);


        this.handler.state = states.LISTPRIOR;
        this.emit(':ask', generate_prior_intents(activity, date));
    },
    'SelectBookingIntent': function() {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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

            // TODO: Use the parameters returned to find available bookings.
            if(isValidAvailableClass(activity, date, time)) {
                this.handler.state = states.MAKEBOOKINGCONFIRM;
                this.emit(':ask', make_booking_response);
            } else {
                this.handler.state = states.MAKEBOOKING;
                this.emit(':ask', make_booking_not_found_response + generate_available_intent(activity, date, time));
            }
        }
    },
    'ViewMoreInformationIntent': function() {
        console.log('ViewMoreInformationIntent recieved');
        this.handler.state = states.VIEWMOREINFORMATION;
        this.emit(':ask', view_more_information_response);
    },
    'AMAZON.HelpIntent': function() {
        console.log("Help Intent recieved");

        this.emit(':ask', help_request_root_response);
    },
    'AMAZON.CancelIntent': function() {
        console.log("Cancel Intent recieved");
        this.emit(':tell', end_session_root_response);
    },
    'AMAZON.StopIntent': function() {
        console.log("Stop Intent recieved");
        this.emit(':tell', end_session_root_response);
    },
    'Unhandled': function() {
        console.log("Unhandled intent recieved");

        this.emit(':ask', invalid_request_root_response);
    }
};

// Deals with initializing the state when there is no state then forwards the request.
var newsession_handlers = {
    'LaunchRequest': authentication_state_wrapper('LaunchRequest'),
    'CancelBookingIntent': authentication_state_wrapper('CancelBookingIntent'),
    'CancelBookingBeginIntent' : authentication_state_wrapper('CancelBookingBeginIntent'),
    'GiveFeedbackIntent': authentication_state_wrapper('GiveFeedbackIntent'),
    'ListActiveIntent': authentication_state_wrapper('ListActiveIntent'),
    'ListAvailableIntent': authentication_state_wrapper('ListAvailableIntent'),
    'ListPriorIntent': authentication_state_wrapper('ListPriorIntent'),
    'SelectBookingIntent': authentication_state_wrapper('SelectBookingIntent'),
    'ViewMoreInformationIntent': authentication_state_wrapper('ViewMoreInformationIntent'),
    'Unhandled': authentication_state_wrapper('Unhandled'),
    'AMAZON.CancelIntent': function() {
        console.log("Cancel Intent recieved");
        this.emit(':tell', end_session_root_response);
    },
    'AMAZON.StopIntent': function() {
        console.log("Stop Intent recieved");
        this.emit(':tell', end_session_root_response);
    }
};

// If unauthenticated exit skill irrespective of requested intent - without home gym no info can be provided.
var unauthenticated_handlers = Alexa.CreateStateHandler(states.UNAUTHENTICATED, {
    'Unhandled': function() {
        this.emit(':tell', unauthenticated_client_response);
    }
});

// From the root location, access all sub trees.
var root_handlers = Alexa.CreateStateHandler(states.ROOT, handlers);

var makebooking_handlers = Alexa.CreateStateHandler(states.MAKEBOOKING, {

    'SelectBookingIntent': function() {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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

            // TODO: Use the parameters returned to find available bookings.
            if(isValidAvailableClass(activity, date, time)) {
                this.handler.state = states.MAKEBOOKINGCONFIRM;
                this.emit(':ask', make_booking_response);
            } else {
                this.handler.state = states.MAKEBOOKING;
                this.emit(':ask', make_booking_not_found_response + generate_available_intent(activity, date, time));
            }
        }
    },

    'AMAZON.HelpIntent': function() {
        console.log("makebooking: helpintent recieved");

        this.emit(':ask', help_request_makebooking_response);


    },

    'CustomYesIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },

    'CustomNoIntent': function() {
        this.shouldEndSession = true;
    },
    'LaunchRequest'    : function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.PreviousIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },
    'AMAZON.StartOverIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.CancelIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function() {
        this.emit(':tell', unhandled_request_make_booking_response);
    }
});


var makebookingconfirm_handler = Alexa.CreateStateHandler(states.MAKEBOOKINGCONFIRM, {
    'LaunchRequest'    : function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function() {
        console.log("makebookingconfirm: help request");
        var date = this.attributes["params"].date;
        var time = this.attributes["params"].time;
        var activity = this.attributes["params"].activity;
        this.emit(':ask', generate_makebookingconfirm_help_response(activity, date, time));
    },

    'CustomYesIntent': function() {
        console.log("makebookingconfirm: yes request");

        var date = this.attributes["params"].date;
        var time = this.attributes["params"].time;
        var activity = this.attributes["params"].activity;

        make_booking(activity, date, time);

        this.emit(':tell', "Okay sure, I have made the booking. Check the amazon app for more information");

    },
    'CustomNoIntent': function() {
        console.log("makebookingconfirm: no intent");
        this.emit(':tell', confirmation_denied_make_booking_response);
    },

    'AMAZON.PreviousIntent': function() {
        this.handler.state = states.MAKEBOOKING;
        this.emitWithState("SelectBookingIntent")
    },
    'AMAZON.RepeatIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },


    'AMAZON.StartOverIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function() {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

var cancelbookingbegin_handler = Alexa.CreateStateHandler(states.CANCELBOOKINGBEGIN, {
    'CancelBookingIntent': function() {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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


            if(this.event.request.intent.confirmationStatus === 'CONFIRMED') {

                if(isValidActiveBooking(activity, date, time)) {
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
    'ListActiveIntent': function() {
        console.log('ListActiveIntent recieved');
        this.emit(':ask', generate_active_intent());
    },
    'LaunchRequest'    : function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function() {
        console.log("cancelbookingbegin: helpintent");
        this.emit(':ask', help_request_cancel_booking_begin_response)
    },

    'AMAZON.PreviousIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },

    'CustomYesIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },

    'CustomNoIntent': function() {
        this.emit(':tell', confirmation_denied_cancel_booking_response);
    },


    'AMAZON.StartOverIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function() {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

var viewmoreinformation_handler = Alexa.CreateStateHandler(states.VIEWMOREINFORMATION, {
    'ListActiveIntent': function() {
        console.log('ListActiveIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', generate_active_intent());
    },
    'ListAvailableIntent': function() {
        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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
            this.emit(':ask', generate_available_intent(activity, date, time));
        }
    },
    'ListPriorIntent': function() {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;


        console.log(date);
        console.log(activity);


        this.handler.state = states.LISTPRIOR;
        this.emit(':ask', generate_prior_intents(activity, date));
    },
    'LaunchRequest'    : function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function() {
        console.log("viewmoreinformation: helpintent");
        this.emit(':ask', help_request_view_information_response);
    },


    'AMAZON.PreviousIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },


    'AMAZON.StartOverIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function() {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

var listprior_handler = Alexa.CreateStateHandler(states.LISTPRIOR, {
    'ListPriorIntent': function() {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;
        console.log(date);
        console.log(activity);
        this.emit(':ask', generate_prior_intents(activity, date));
    },
    'GiveFeedbackIntent': function() {
        console.log('GiveFeedbackIntent recieved');

        if (this.event.request.dialogState == "STARTED" || this.event.request.dialogState == "IN_PROGRESS"){
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
            if(this.event.request.intent.confirmationStatus === 'CONFIRMED') {
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
    'LaunchRequest'    : function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function() {
        console.log("listprior: help intent");
        this.emit(':ask', help_request_list_prior_response);
    },

    'CustomYesIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },
    'CustomNoIntent': function() {
        this.shouldEndSession = true;
    },

    'AMAZON.PreviousIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.RepeatIntent': function() {
        this.emitWithState("AMAZON.HelpIntent");
    },


    'AMAZON.StartOverIntent': function() {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },

    'AMAZON.CancelIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.CancelIntent");
    },
    'AMAZON.StopIntent': function() {
        this.handler.state = "";
        this.emitWithState("AMAZON.StopIntent");
    },
    'Unhandled': function() {
        this.emitWithState("AMAZON.HelpIntent");
    }
});

exports.handler =  function(event, context, callback) {
    var appId = process.env.APPLICATION_ID;

    // Authenticate user using token from Microsoft ADBC

    var token = undefined //event.session.user.accessToken;


    if(token || debug) {
        // TODO: Implement token validation and use

        if(event.session.attributes) {
            event.session.attributes["authenticated"] = true;
            event.session.attributes["user_id"] = "null";
        } else {
            event.session.attributes = {
                authenticated: false,
            };
        }
    } else {
        // TODO: Implement sign in reminder

        if(event.session.attributes) {
            event.session.attributes["authenticated"] = false;
        } else {
            event.session.attributes = {
                authenticated: false,
            };
        }
    }


    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(root_handlers, unauthenticated_handlers, newsession_handlers, makebooking_handlers, makebookingconfirm_handler, cancelbookingbegin_handler, viewmoreinformation_handler, listprior_handler);
    alexa.execute();
}

