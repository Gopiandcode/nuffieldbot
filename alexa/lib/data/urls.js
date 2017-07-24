module.exports = {
    options_token_request: {
		method: 'POST',
		url: 'https://nuffield-uat.bookingbug.com/api/v1/login',
		headers: {
            'cache-control': 'no-cache',
			'app-key'      : '5120f5ff0e09b10140b86dc03abf5e97',
			'app-id'       : 'f91f9b66'
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
			'app-key'      : '5120f5ff0e09b10140b86dc03abf5e97',
			'app-id'       : 'f91f9b66'
        }
    },
		event_group_request: {
		method: 'GET',
		url: 'https://nuffield-uat.bookingbug.com/api/v1/37059/event_groups',
		headers: {
            'cache-control': 'no-cache',
			'app-key'      : '5120f5ff0e09b10140b86dc03abf5e97',
			'app-id'       : 'f91f9b66'
        }
	}
}