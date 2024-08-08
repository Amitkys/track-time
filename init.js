const mongoose = require('mongoose');
const TimeTrack = require('./models/log_time.js');



// Async function to connect to MongoDB

async function main() {
  const dbUri = process.env.MONGODB_URI || "mongodb+srv://amitkys:qgejTqCQyRrRnZbVL@cluster0.jiwi9.mongodb.net/Track-time";
  try {
      await mongoose.connect(dbUri);
      console.log(`Connected To DB`);
  } catch (err) {
      console.log(`Error in Connectivity to DB`, err);
  }
}

const sampleData = [
  {
      "date": "2024-08-03T00:00:00.000Z",
      "track": [
        { "time": "1", "activity": "Wake up", "proHour": true, "sleep": true }
        // { "time": "2", "activity": "Sleep" },
        // { "time": "3", "activity": "Sleep" },
        // { "time": "4", "activity": "Sleep" },
        // { "time": "5", "activity": "Sleep" },
        // { "time": "6", "activity": "Exercise" },
        // { "time": "7", "activity": "Breakfast" },
        // { "time": "8", "activity": "Work on project" },
        // { "time": "9", "activity": "Work on project" },
        // { "time": "10", "activity": "Work on project" }
        
      ]
    }
    
]

TimeTrack.insertMany(sampleData).then((result) =>{
    console.log('initial data is inserted');
}).catch((err) => {
    console.log('error while inserting intial data ', err);
})

main();


