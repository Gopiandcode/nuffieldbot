var request = require('request');
const child_process = require('child_process');





// Converts a time to a speakable format
function timestring(hour, minutes) {
    var meridian = "";
  
    if(hour >= 12) {
      meridian = "PM";
      if(hour !== 12) hour -= 12;
    } else {
      meridian = "AM";
      if(hour === 0) {
        meridian = "";
        hour = "midnight";
      }
    }
    switch(minutes) {
      case 15:
        return "quarter past " + hour + (meridian ? " " + meridian : "");
      case 30:
        return "half past " + hour + (meridian ? " " + meridian : "");
      case 45:
        if(hour === 23) {
          hour = "midnight";
          meridian = "";
        }
        else if(hour === 12) {
          hour -= 11;
          meridian = "PM";
        }
        return "quarter to " + (hour) + (meridian ? " " + meridian : "");
      case 10:
        return "ten past " + hour + (meridian ? " " + meridian : ""); 
      case 50:
        if(hour === 23) {
          hour = "midnight";
          meridian = "";
        }
        else if(hour === 12) {
          hour -= 11;
          meridian = "PM";
        }
        return "ten to " + (hour) + (meridian ? " " + meridian : "");
      default:
        return (hour) + (minutes !== 0 ? " " + minutes : "") + (meridian ? " " + meridian : ""); 
    }
  
  
}

// converts a date to a speakable format
function dateToString(date, duration) {
  if(!date) date = new Date();

  var year =  date.getFullYear();
  var month = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September','October','November','December'][date.getMonth()];

  var ordinal = function (i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
  }(date.getDate());
  var day = ['Monday','Tuesday','Wednesday', 'Thursday', 'Friday','Saturday', 'Sunday'][date.getDay()];

  var hour = date.getHours();
  var minutes = date.getMinutes();
  
  var time_string = timestring(hour, minutes);
  
  return day + " the " + ordinal + " of " + month + " " + year + " at " + time_string + (duration ? " for " + duration + " minutes" : "");
}



// Converts the response from the Bookingbug api into a readable format
function speachifyResponse(data){
  var events = data._embedded.events;
  var dyn_text = [];
  
  events.forEach(function(item) {
      name = item.description;

      var date_str = dateToString(new Date(item.datetime), item.duration);
    
      dyn_text.push(name + " on " + date_str); 
  });

  return dyn_text.join(" , and, a ");
}

// Code Snippet from: https://github.com/alexa/skill-sample-nodejs-calendar-reader/blob/master/src/index.js
// Given an AMAZON.DATE slot value parse out to usable JavaScript Date object
// Utterances that map to the weekend for a specific week (such as ?this weekend?) convert to a date indicating the week number and weekend: 2015-W49-WE.
// Utterances that map to a month, but not a specific day (such as ?next month?, or ?December?) convert to a date with just the year and month: 2015-12.
// Utterances that map to a year (such as ?next year?) convert to a date containing just the year: 2016.
// Utterances that map to a decade convert to a date indicating the decade: 201X.
// Utterances that map to a season (such as ?next winter?) convert to a date with the year and a season indicator: winter: WI, spring: SP, summer: SU, fall: FA)
function getDateFromSlot(rawDate) {
    // try to parse data
    var date = new Date(Date.parse(rawDate));
    var eventDate = {};

    
    // if could not parse data must be one of the other formats
    if (isNaN(date)) {
        // to find out what type of date this is, we can split it and count how many parts we have see comments above.
        var res = rawDate.split("-");
        // if we have 2 bits that include a 'W' week number
        if (res.length === 2 && res[1].indexOf('W') > -1) {
            var dates = getWeekData(res);
            eventDate["startDate"] = new Date(dates.startDate);
            eventDate["endDate"] = new Date(dates.endDate);
            // if we have 3 bits, we could either have a valid date (which would have parsed already) or a weekend
        } else if (res.length === 3) {
            var dates = getWeekendData(res);
            eventDate["startDate"] = new Date(dates.startDate);
            eventDate["endDate"] = new Date(dates.endDate);
            // anything else would be out of range for this skill
        } else {
            eventDate["error"] = dateOutOfRange;
        }
        // original slot value was parsed correctly
    } else {
        eventDate["startDate"] = new Date(new Date(date).setUTCHours(0, 0, 0, 0));
        eventDate["endDate"] = new Date(new Date(date).setUTCHours(24, 0, 0, 0));
    }
    return eventDate;
}
// Also from https://github.com/alexa/skill-sample-nodejs-calendar-reader/blob/master/src/index.js
function getWeekData(res) {
    if (res.length === 2) {

        var mondayIndex = 0;
        var sundayIndex = 6;

        var weekNumber = res[1].substring(1);

        var weekStart = w2date(res[0], weekNumber, mondayIndex);
        var weekEnd = w2date(res[0], weekNumber, sundayIndex);

        return Dates = {
            startDate: weekStart,
            endDate: weekEnd,
        };
    }
}

// Also from https://github.com/alexa/skill-sample-nodejs-calendar-reader/blob/master/src/index.js
var w2date = function (year, wn, dayNb) {
    var day = 86400000;

    var j10 = new Date(year, 0, 10, 12, 0, 0),
        j4 = new Date(year, 0, 4, 12, 0, 0),
        mon1 = j4.getTime() - j10.getDay() * day;
    return new Date(mon1 + ((wn - 1) * 7 + dayNb) * day);
};

// Code snippet from: https://stackoverflow.com/questions/141348/what-is-the-best-way-to-parse-a-time-into-a-date-object-from-user-input-in-javas
function parseTime(timeString) {    
    if (timeString == '') return null;

    var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i); 
    if (time == null) return null;

    var hours = parseInt(time[1],10);    
    if (hours == 12 && !time[4]) {
          hours = 0;
    }
    else {
        hours += (hours < 12 && time[4])? 12 : 0;
    }   
    var d = new Date();             
    d.setHours(hours);
    d.setMinutes(parseInt(time[3],10) || 0);
    d.setSeconds(0, 0);  
    return d;
}

function addTimetoDate(date, time) {
  return date.setTime(time.getTime());
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function datestr(date) {
    var date = new Date();
    var str = '';
    str += date.getFullYear();
    str += '-';
    str += pad(date.getMonth(), 2);
    str += '-';
    str += pad(date.getDay(),2);
    return str;
}

function combineEvents(events, event_chains) {
    var cache = {};
    var results = [];


    events.forEach(function(event) {
        var event_chain_id = String(event.event_chain_id);
        if(!cache[event_chain_id]) {
            for(var i = 0; i<event_chains.length; i++) {
                if(String(event_chains[i].id) == event_chain_id) {
                    event.chain_name = event_chains[i].name;                 
                    results.push(event);
                    return;
                }
                cache[String(event_chains[i].id)] = event_chains[i];
            }
        } else {
            event.chain_name = cache[event_chain_id].name;
            results.push(event);
            return;
        }
    })

   return results;
}


 
function normalize(str) {
    var string = String(str);
    string = string.toLowerCase();
    string = string.replace(/[^a-z ]/g, '')
    return string;
}

function parse_data_async(events,log, callback) {
    var process = child_process.exec('node  D:\\home\\site\\wwwroot\\alexa\\lib\\child_events_parse.js', function(err, stdout, stderr) {
        if(err) log('error: ' + err);
        var output = JSON.parse(stdout);
        callback(output);
    });
    process.stdin.end(JSON.stringify(events), 'utf8');
}

// Function from https://stackoverflow.com/questions/25300213/how-to-covert-1200-pm-into-date-object-in-javascript
function setDateTime(time, date){
    var startTime = date ? date : new Date();
    var parts = time.match(/(\d+):(\d+) (AM|PM)/);
    if (parts) {
            var hours = parseInt(parts[1]),
            minutes = parseInt(parts[2]),
            tt = parts[3];
        if (tt === 'PM' && hours < 12) hours += 12;
     startTime.setHours(hours, minutes, 0, 0);
    }
    return startTime;
}

module.exports = {
    'speachify': speachifyResponse,
    'convertDateSlotValue': getDateFromSlot,
    'convertTimeSlotValue': parseTime,
    'urlDate': datestr,
    'convertAlexaSpeach': normalize,
    'buildEventGroupDatabase': parse_data_async,
    'convertTimeSlotValueAlt': setDateTime
}
