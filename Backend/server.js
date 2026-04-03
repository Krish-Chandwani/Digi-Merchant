const app=require('../Backend/src/app');
require('dotenv').config();
const connectDB = require('../Backend/src/config/db');

connectDB();

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});

