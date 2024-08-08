require('dotenv').config(); // Add this line at the top of your app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const TimeTrack = require('./models/log_time.js');


const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, './public')));
app.use(methodOverride('_method'));

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

app.get("/", (req, res) => {
  res.render('./main.ejs');
})

// Route to get data for a specific date
app.get('/data', async (req, res) => {
    const { date } = req.query;
    try {
        // console.log(date);
        const timeTrack = await TimeTrack.findOne({ date });
        if (timeTrack) {
            // Sort the track array by the correct order
            timeTrack.track.sort((a, b) => {
                const timeA = parseInt(a.time, 10);
                const timeB = parseInt(b.time, 10);
                if (timeA === 0) return 1;
                if (timeB === 0) return -1;
                return timeA - timeB;
            });
        }
        res.json(timeTrack || { date, track: [] });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Route to add or update activity
app.post('/add-activity', async (req, res) => {
    const { date, hour, activity, proHour, sleep } = req.body;

    try {
        let timeTrack = await TimeTrack.findOne({ date });

        if (!timeTrack) {
            timeTrack = new TimeTrack({ date, track: [] });
        }

        const existingTrack = timeTrack.track.find(track => track.time === hour.toString());

        if (existingTrack) {
            existingTrack.activity = activity;
            existingTrack.proHour = proHour; // Update proHour, sleep
            existingTrack.sleep = sleep;
        } else {
            timeTrack.track.push({ time: hour.toString(), activity, proHour, sleep }); // Include proHour, sleep
        }

        await timeTrack.save();
        res.status(200).json({ message: 'updated!' });
    } catch (err) {
        console.error('Error updating activity:', err);
        res.status(500).json({ message: 'Error updating activity' });
    }
});


// Route to delete an activity
app.post('/delete-activity', async (req, res) => {
  const { date, hour } = req.body;
  try {
      const result = await TimeTrack.updateOne(
          { date },
          { $pull: { track: { time: hour.toString() } } }
      );
      if (result.modifiedCount > 0) {
          res.status(200).json({ message: 'Deleted!' });
      } else {
          res.status(404).json({ message: 'No activity found to delete' });
      }
  } catch (err) {
      console.error('Error deleting activity:', err);
      res.status(500).json({ message: 'Error deleting activity' });
  }
});

app.get('/demo', async (req, res) => {
    try {
        const { date } = req.query;
        const allData = await TimeTrack.find({ date });
        
        if (!allData.length) {
            return res.render('./timeParts/demo.ejs', { allData: [], date, error:true, errorMsg: 'No data found for this date' });
        }
        
        res.render('./timeParts/demo.ejs', { allData, date, error: false }); // if data found, client will handle that there is no error
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/weekly', async (req, res) => {
    // console.log('weekly request');
    try {
        const { startDate } = req.query;
        // const startDate = '2024-08-10'
        // console.log(startDate);
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Set the end date to 7 days later

        const allData = await TimeTrack.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        if (!allData.length) {
            return res.render('./timeParts/weekly.ejs', { allData: [], startDate, endDate: end.toISOString().split('T')[0], error: true, errorMsg: 'No data found for this week' });
        }
        // console.log(allData);

        res.render('./timeParts/weekly.ejs', { allData, startDate, endDate: end.toISOString().split('T')[0], error:false });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});





app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running at http://0.0.0.0:3000');
});

main();
