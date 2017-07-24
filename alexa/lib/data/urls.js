module.exports = {
    options_token_request: {
        method: 'POST',
        url: 'https://nuffield-uat.bookingbug.com/api/v1/login',
        headers: {
            'cache-control': 'no-cache',
            'app-key': '5120f5ff0e09b10140b86dc03abf5e97',
            'app-id': 'f91f9b66'
        },
        formData: {
            email: 'csc@agilegxp.com',
            password: 'nuffield123?'
        }
    },
    options_event_request: {
        method: 'GET',
        url: '',
        headers: {
            'cache-control': 'no-cache',
            'app-key': '5120f5ff0e09b10140b86dc03abf5e97',
            'app-id': 'f91f9b66'
        }
    },
    event_group_request: {
        method: 'GET',
        url: 'https://nuffield-uat.bookingbug.com/api/v1/37059/event_groups',
        headers: {
            'cache-control': 'no-cache',
            'app-key': '5120f5ff0e09b10140b86dc03abf5e97',
            'app-id': 'f91f9b66'
        }
    },
    retrieve_events_url: function (booking_dates, id) {
        let value = 'https://nuffield-uat.bookingbug.com/api/v1/37059/events?start_date=' + booking_dates.startDate.toISOString() + '&end_date=' + booking_dates.endDate.toISOString() + '&per_page=2&include_non_bookable=false'
        if (id) {
            value += "&event_group_id=" + id;
        }
        return value;
    }
}