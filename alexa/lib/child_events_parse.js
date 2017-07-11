
function parse_event_groups(event_groups) {
    var results = {};
    
    event_groups.forEach(function(item) {
        results[String(item.id)] = {
            id: item.id,
            name : item.name,
            alexa_name : normalize(item.name)
        };
    });
    return results;
}

function normalize(str) {
    var string = String(str);
    string = string.toLowerCase();
    string = string.replace(/[^a-z ]/g, '')
    return string;
}


// Readin JSON snippet from https://gist.github.com/kristopherjohnson/5065599
var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];



stdin.setEncoding('utf8');

stdin.on('data', function(chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function() {
    var inputJSON = inputChunks.join(''),
        parsedData= JSON.parse(inputJSON);
    var response = parse_event_groups(parsedData);
    response = JSON.stringify(response);
    stdout.write(JSON.stringify(response), function(err) {
    });


})