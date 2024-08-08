const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const timetTrackSchema = new Schema({
   
        "date": Date, 
        "track": [
          {
            "time": String, 
            "activity": String,
            "proHour": {type: Boolean, default: false},
            "sleep": {type: Boolean, default: false}
          }
          
        ]
     
      
});



const TimeTrack = mongoose.model("TimeTrack", timetTrackSchema);
module.exports = TimeTrack;