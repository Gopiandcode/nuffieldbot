var fs = require('fs');
var readline = require('readline');

var r1 = readline.createInterface({
    input: process.stdin, output: process.stdout
});



var events = require('./events.json');


next = true;

var i = 0;

var updated = [];



r1.setPrompt("what is the alexa name for " + events[i].name + "?");
r1.prompt();

r1.on('line', function (data) {

    var result = events[i];
    result['alexa'] = data;
    updated.push(result);


    i++;
    if(i < events.length) {
        r1.setPrompt("what is the alexa name for " + events[i].name + "?");
        r1.prompt();
    } else {
        
    r1.close();

    fs.writeFile('alexa-events.json', JSON.stringify(updated), function(err) {
        if(err) throw new Error(err);
    });
    }
})
