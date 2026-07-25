const express = require('express');
const cors = require('cors');
const app = express();

const ShopRoutes = require('./routes/shop.routes');
const AuthRoutes = require('./routes/auth.routes');
const ProductRoutes = require('./routes/product.routes');
const OrderRoutes = require('./routes/order.routes');
const AnalyticsRoutes = require('./routes/analytics.routes');
const NotificationRoutes = require('./routes/notification.routes');
const PaymentRoutes = require('./routes/payment.routes');
const StockAlertRoutes = require('./routes/stockAlert.routes');
const CouponRoutes = require('./routes/coupon.routes');

app.use(cors());
app.use(express.json());

// Sample route
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

app.use('/api/shops', ShopRoutes);
app.use('/api/auth',AuthRoutes );
app.use('/api', ProductRoutes);
app.use('/api/', OrderRoutes);
app.use('/api', AnalyticsRoutes);
app.use('/api/notifications', NotificationRoutes);
app.use('/api/payments', PaymentRoutes);
app.use('/api/stock-alerts', StockAlertRoutes);
app.use('/api/coupons', CouponRoutes);

module.exports = app;