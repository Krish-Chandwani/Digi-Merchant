const app=require('./src/app');
require('dotenv').config();
const connectDB = require('./src/config/db');

connectDB();

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});

