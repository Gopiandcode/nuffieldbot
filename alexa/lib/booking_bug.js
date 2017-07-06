var request = require('request');
var event_reference = require('./events.json');

// Scans through the list of events + ids to return the event name
function getEventName(event_id) {
    for(var i in event_reference) {
        var obj = event_reference[i];
        if(obj.id === event_id)
            return obj.name;
    }
    return undefined;
}

// Given an alexa slot value, return the event id
function getEventId(alexa_name) {
  for (var i in event_reference) {
    var obj = event_reference[i];
    if(obj.alexa_name.toLowerCase() === alexa_name.toLowerCase()) {
      return obj.id;
    }
  }
  return undefined;
}

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
      var name = getEventName(item.id);
      if(!name) {
        name = item.description;
      }
      var date_str = dateToString(new Date(item.datetime), item.duration);
    
      dyn_text.push(name + " on " + date_str); 
  });

  return dyn_text.join(" , and, a ");
}

module.exports = {
    'speachify': speachifyResponse,
    'convertSkillValue': getEventId
}
