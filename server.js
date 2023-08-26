const express = require('express');
const app = express();
require('dotenv').config();
const dbConfig = require('./config/dbConfig');
const port = process.env.PORT || 5000;
app.use(express.json());

const usersRoute = require('./routes/usersRoute');
const busesroute = require('./routes/busesroute');
const bookingsroute = require('./routes/bookingroute');
app.use('/api/users', usersRoute);
app.use('/api/buses', busesroute);
app.use('/api/bookings', bookingsroute);
app.listen(port, () => console.log(`node server Listening on port ${port}`));
