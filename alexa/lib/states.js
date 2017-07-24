const cards = require('./data/cards');
const sayings = require('./data/sayings');
const api_wrapper = require('./utility/api_wrapper');

let states =  {
    ROOT: '_ROOT',
    MAKEBOOKING: '_MAKEBOOKING',
    MAKEBOOKINGCONFIRM: '_MAKEBOOKINGCONFIRM',
    CANCELBOOKINGBEGIN: '_CANCELBOOKINGBEGIN',
    VIEWMOREINFORMATION: '_VIEWMOREINFORMATION',
    LISTPRIOR: '_LISTPRIOR',
    UNAUTHENTICATED: '_UNAUTHENTICATED'
};

function authentication_state_wrapper(state) {
    return function () {

        if (this.attributes.authenticated || debug) {
            this.handler.state = states.ROOT;
            this.emitWithState(state);
        } else {
            this.handler.state = states.UNAUTHENTICATED;
            this.emitWithState(state);
        }
    };
}


base_handlers  =  {
    'LaunchRequest': function () {
        this.emit(':ask', sayings.launch_request_response);
    },
    'CancelBookingIntent': function () {

        if (this.event.request.dialogState === "STARTED" || this.event.request.dialogState === "IN_PROGRESS") {
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

            let date = this.event.request.intent.slots.date;
            let time = this.event.request.intent.slots.time;
            let activity = this.event.request.intent.slots.activity;



            // check if user wants to cancel his booking.
            if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {

                api_wrapper.is_valid_active_booking(activity, date, time, {}, (generated_boolean) => {
                        if (generated_boolean) {
                            api_wrapper.cancel_booking(activity, date, time, {}, (success) => {
                                if(success) {
                                    let success_card = cards.Cancel_Booking_Card_Success(activity, date, time);
                                    this.emit(':tellWithCard', sayings.confirm_canceled_booking_response, success_card.title, success_card.content, success_card.imageObj);
                                } else {

                                    this.emit(':tell', sayings.cancel_booking_failed_response);
                                }

                            });
                        } else {
                            this.emit(":tell", sayings.invalid_booking_cancel_booking_response);
                        }
                    }
                );

            } else {

                this.emit(':tell', sayings.confirmation_denied_cancel_booking_response);

            }

        }
    },
    'CancelBookingBeginIntent': function () {
        console.log('Root: CancelBookingBeginIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        this.emit(':ask', sayings.cancel_booking_begin);
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
                api_wrapper.is_valid_past_booking(activity, date, time, {}, (generated_boolean) => {
                    if (generated_boolean) {
                        api_wrapper.give_feedback(activity, date, time, score, {}, (success) => {
                            if(success)
                                this.emit(":tell", sayings.confirm_give_feedback_response);
                            else
                                this.emit(':tell', sayings.give_feedback_failed_response)
                        });
                    } else {
                        this.handler.state = states.LISTPRIOR;
                        this.emitWithState(":ask", sayings.not_found_give_feedback_response);
                    }
                });
            } else {
                this.emit(":tell", sayings.confirmation_denied_give_feedback_response)
            }
        }
    },
    'ListActiveIntent': function () {
        console.log('ListActiveIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        api_wrapper.generate_active_intent({}, (generated_content) => {
            this.emit(generated_content.cmd, generated_content.data)
        });
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
            var activity = this.event.request.intent.slots.activity;
            console.log(date);
            console.log(activity);
            console.log('ListAvailableIntent recieved');
            this.handler.state = states.MAKEBOOKING;
            api_wrapper.generate_available_intent(activity, date, undefined, this.attributes, (data) => {
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
        api_wrapper.generate_prior_intents(activity, date, {}, (generated_content) => {
            this.emit(generated_content.cmd, generated_content.data)
        });
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
            api_wrapper.is_valid_available_class(activity, date, time, this.attributes, (validity) => {


                if (validity) {
                    this.handler.state = states.MAKEBOOKINGCONFIRM;
                    this.emit(':ask', sayings.make_booking_response);
                } else {
                    this.handler.state = states.MAKEBOOKING;
                    api_wrapper.generate_available_intent(activity, date, time, this.attributes, (data) => {
                        this.emit(data.cmd, sayings.make_booking_not_found_response + data.data);
                    });
                }

            });
        }
    },
    'ViewMoreInformationIntent': function () {
        console.log('ViewMoreInformationIntent recieved');
        this.handler.state = states.VIEWMOREINFORMATION;
        this.emit(':ask', sayings.view_more_information_response);
    },
    'AMAZON.HelpIntent': function () {
        console.log("Help Intent recieved");

        this.emit(':ask', sayings.help_request_root_response);
    },
    'AMAZON.CancelIntent': function () {
        console.log("Cancel Intent recieved");
        this.emit(':tell', sayings.end_session_root_response);
    },
    'AMAZON.StopIntent': function () {
        console.log("Stop Intent recieved");
        this.emit(':tell', sayings.end_session_root_response);
    },
    'Unhandled': function () {
        console.log("Unhandled intent recieved");

        this.emit(':ask', sayings.invalid_request_root_response);
    }
};

let new_session_handlers = {
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
        this.emit(':tell', sayings.end_session_root_response);
    },
    'AMAZON.StopIntent': function () {
        console.log("Stop Intent recieved");
        this.emit(':tell', sayings.end_session_root_response);
    }
};

let unauthenticated_handers = {
    'Unhandled': function () {

        this.emit(':tellWithLinkAccountCard', sayings.unauthenticated_client_response);
    }
};

let makebooking_handlers =  {

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
            let date = this.event.request.intent.slots.date;
            let time = this.event.request.intent.slots.time;
            let activity = this.event.request.intent.slots.activity;

            this.attributes['params'] = {
                date: date,
                time: time,
                activity: activity
            };
            //
            // TODO: Use the parameters returned to find available bookings.
            api_wrapper.is_valid_available_class(activity, date, time, this.attributes, (validity) => {
                if (validity) {
                    this.handler.state = states.MAKEBOOKINGCONFIRM;
                    this.emit(':ask', sayings.make_booking_response);
                } else {
                    this.handler.state = states.MAKEBOOKING;
                    api_wrapper.generate_available_intent(activity, date, time, this.attributes, (data) => {
                        this.emit(data.cmd, sayings.make_booking_not_found_response + data.data);
                    });
                }
            });
        }
    },

    'AMAZON.HelpIntent': function () {
        console.log("makebooking: helpintent recieved");

        this.emit(':ask', sayings.help_request_makebooking_response);


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
        this.emit(':tell', sayings.unhandled_request_sayings.make_booking_response);
    }
};

let makebookingconfirm_handlers =  {
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        let date = this.attributes["params"].date;
        let time = this.attributes["params"].time;
        let activity = this.attributes["params"].activity;
        api_wrapper.generate_makebookingconfirm_help_response(activity, date, time, {}, (generated_content) => {
            this.emit(generated_content.cmd,generated_content.data);
        });
    },

    'CustomYesIntent': function () {
        console.log("makebookingconfirm: yes request");

        let date = this.attributes["params"].date;
        let time = this.attributes["params"].time;
        let activity = this.attributes["params"].activity;

        api_wrapper.make_booking(activity, date, time, {}, (success) => {
            if(success) {
                let success_card = cards.Make_Booking_Card_Success(activity,date, time);
                this.emit(':tellWithCard', sayings.make_booking_success, success_card.title, success_card.content, success_card.imageObj);
            }
            else {
                let fail_card = cards.Make_Booking_Card_Failure(activity, date, time);
                this.emit(':tellWithCard', sayings.make_booking_failure, fail_card.title, fail_card.content, fail_card.imageObj);
            }

        });
    },
    'CustomNoIntent': function () {
        console.log("makebookingconfirm: no intent");
        this.emit(':tell', sayings.confirmation_denied_sayings.make_booking_response);
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
};

let cancelbookingbegin_handler = {
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

                api_wrapper.is_valid_active_booking(activity, date, time, {}, (generated_boolean) => {
                    if (generated_boolean) {
                        api_wrapper.cancel_booking(activity, date, time, this.attributes, (success)=> {
                            if(success) {
                                let success_card = cards.Cancel_Booking_Card_Success(activity, date, time);
                                this.emit(':tellWithCard', sayings.confirm_canceled_booking_response, success_card.title, success_card.content, success_card.imageObj);
                            } else {
                                let fail_card = cards.Cancel_Booking_Card_Failed(activity, date, time);
                                this.emit(':tellWithCard', sayings.cancel_booking_failed_response, fail_card.title, fail_card.content, fail_card.imageObj);
                            }
                        });
                    } else {
                        this.emit(":tell", sayings.invalid_booking_cancel_booking_response);
                    }

                });

            } else {

                this.emit(':tell', sayings.confirmation_denied_cancel_booking_response);

            }

        }
    },
    'ListActiveIntent': function () {
        console.log('ListActiveIntent recieved');
        api_wrapper.generate_active_intent({}, (generated_content) => {
            this.emit(generated_content.cmd, generated_content.data)
        });
    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("cancelbookingbegin: helpintent");
        this.emit(':ask', sayings.cancel_booking_begin)
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
        this.emit(':tell', sayings.confirmation_denied_cancel_booking_response);
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
};

let viewmoreinformation_handler = {
    'ListActiveIntent': function () {
        console.log('ListActiveIntent recieved');
        this.handler.state = states.CANCELBOOKINGBEGIN;
        api_wrapper.generate_active_intent({}, (generated_content) => {
            this.emit(generated_content.cmd, generated_content.data)
        });
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
            api_wrapper.generate_active_intent({}, (generated_content) => {
                this.emit(generated_content.cmd, generated_content.data)
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
        api_wrapper.generate_prior_intents(activity, date, {}, (generated_content) => {
            this.emit(generated_content.cmd, generated_content.data)
        });
    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("viewmoreinformation: helpintent");
        this.emit(':ask', sayings.help_request_view_information_response);
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
};

let listprior_handler = {
    'ListPriorIntent': function () {
        console.log('ListPriorIntent recieved');
        var date = this.event.request.intent.slots.date;
        var activity = this.event.request.intent.slots.activity;
        console.log(date);
        console.log(activity);
        api_wrapper.generate_prior_intents(activity, date, {}, (generated_content) => {
            this.emit(generated_content.cmd, generated_content.data)
        });
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
                api_wrapper.is_valid_past_booking(activity, date, time, {}, (generated_boolean) => {
                    if (generated_boolean) {
                        give_feedback(activity, date, time, score);
                        this.emit(":tell", sayings.confirm_give_feedback_response);
                    } else {
                        this.emit(":ask", sayings.not_found_give_feedback_response);
                    }
                });
            } else {
                this.emit(":tell", sayings.confirmation_denied_give_feedback_response);
            }


        }

    },
    'LaunchRequest': function () {
        this.handler.state = states.ROOT;
        this.emitWithState('LaunchRequest');
    },
    'AMAZON.HelpIntent': function () {
        console.log("listprior: help intent");
        this.emit(':ask', sayings.help_request_list_prior_response);
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
};

module.exports = {
    'states'                      : states,
    'base_handlers'               : base_handlers,
    'new_session_handlers'        : new_session_handlers,
    'unauthenticated_handers'     : unauthenticated_handers,
    'makebooking_handlers'        : makebooking_handlers,
    'cancelbookingbegin_handler': cancelbookingbegin_handler,
    'viewmoreinformation_handler' : viewmoreinformation_handler,
    'listprior_handler'           : listprior_handler,
    'makebookingconfirm_handlers' : makebookingconfirm_handlers
}