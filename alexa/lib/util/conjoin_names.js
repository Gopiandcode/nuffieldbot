var fs = require('fs');

var events = require('./events.json');
var alexa_names = require('./alexa_names.json')

var updated = [];

for(i in events) {
    var res = events[i];
    res['alexa'] = alexa_names[i];
    updated.push(res);
}



fs.writeFileSync('alexa_events.json', JSON.stringify(updated), 'UTF-8');