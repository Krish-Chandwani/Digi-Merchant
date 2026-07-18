require('dotenv').config();
const http = require('http');
const app = require('../Backend/src/app');
const connectDB = require('../Backend/src/config/db');
const { initSocket } = require('../Backend/src/config/socket');

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});

app.use(limiter);

connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(5000, () => {
  console.log('Server is running on port 5000');
  const emailReady = !!(process.env.EMAIL_USER || '').trim() && !!(process.env.EMAIL_PASS || '').trim();
  console.log(emailReady ? 'Email: configured' : 'Email: NOT configured (EMAIL_USER / EMAIL_PASS missing)');
});
