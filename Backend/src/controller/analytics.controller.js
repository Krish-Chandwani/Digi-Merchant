const Order= require('../models/Order');
const Shop = require('../models/Shop');

async function getShopAnalytics(req, res) {
    try {
        const { shopId } = req.params;  
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        if (shop.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to view analytics for this shop' });
        }

        // Only count paid orders — unpaid COD stays out of analytics until cash is received
        const orders = await Order.find({
            shop: shopId,
            paymentStatus: 'paid'
        });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const deliveredOrders = orders.filter(order => order.status === 'delivered' || order.status === 'completed').length;
        res.status(200).json({
            message: 'Shop analytics retrieved successfully',
            analytics:{
                totalRevenue,
                totalOrders,
                pendingOrders,
                deliveredOrders
            }
        });
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={ getShopAnalytics}