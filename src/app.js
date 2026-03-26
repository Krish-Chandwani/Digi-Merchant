const express = require('express');
const cors = require('cors');
const app = express();

const ShopRoutes = require('./routes/shop.routes');
const AuthRoutes = require('./routes/auth.routes');
const ProductRoutes = require('./routes/product.routes');

app.use(cors());
app.use(express.json());

// Sample route
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

app.use('/api/shops', ShopRoutes);
app.use('/api/auth',AuthRoutes );
app.use('/api', ProductRoutes);

module.exports = app;