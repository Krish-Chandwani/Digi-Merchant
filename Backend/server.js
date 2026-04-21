const app=require('../Backend/src/app');
require('dotenv').config();
const connectDB = require('../Backend/src/config/db');

connectDB();

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

app.use(limiter);
