const data_utilities = require('../utility/data_utilities');

module.exports = {
    'Cancel_Booking_Card_Success': function (class_type, datestring, timestring) {
        let converted_class = data_utilities.convertAlexaSpeach(class_type.value);
        let date_range = data_utilities.convertDateSlotValue(datestring.value);
        date_range = data_utilities.addTimeToDateRange(timestring.value, date_range);

        return {
            title:  'Your ' + converted_class + ' class has been cancelled.',
            content: "At: " + date_range.startDate.toDateString() + " - " + date_range.endDate.toDateString(),
            imageObj: {
                smallImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-low.png',
                largeImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-high.png'
            }
        };
    },
    'Cancel_Booking_Card_Failed': function (class_type, datestring, timestring) {
        let converted_class = data_utilities.convertAlexaSpeach(class_type.value);
        let date_range = data_utilities.convertDateSlotValue(datestring.value);
        date_range = data_utilities.addTimeToDateRange(timestring.value, date_range);

        return {
            title: 'Could not cancel your ' + converted_class + ' class.',
            content: "Unfortunately we could not cancel your booking of " + converted_class + " At: " + date_range.startDate.toDateString() + " - " + date_range.endDate.toDateString() + " due to an unknown error.",
            imageObj: {
                smallImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-low.png',
                largeImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-high.png'
            }
        };
    },
    'Make_Booking_Card_Success': function (class_type, datestring, timestring) {
        let converted_class = data_utilities.convertAlexaSpeach(class_type.value);
        let date_range = data_utilities.convertDateSlotValue(datestring.value);
        date_range = data_utilities.addTimeToDateRange(timestring.value, date_range);

        return {
            title:  'Made a ' + converted_class + ' booking using the Nuffield Alexa skill.',
            content: "At: " + date_range.startDate.toDateString(),
            imageObj: {
                smallImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-low.png',
                largeImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-high.png'
            }
        };
    },
    'Make_Booking_Card_Failure': function (class_type, datestring, timestring) {
        let converted_class = data_utilities.convertAlexaSpeach(class_type.value);
        let date_range = data_utilities.convertDateSlotValue(datestring.value);
        date_range = data_utilities.addTimeToDateRange(timestring.value, date_range);

        return {
            title:  'Could not make a ' + converted_class + ' booking.',
            content: "Unfortunately we couldn't make a booking for " + converted_class + " at " + date_range.startDate.toDateString() + " due to an unknown error.",
            imageObj: {
                smallImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-low.png',
                largeImageUrl: 'https://s3.amazonaws.com/elasticbeanstalk-us-east-1-946263802006/nuffield-logo-high.png'
            }
        };
    }
};


