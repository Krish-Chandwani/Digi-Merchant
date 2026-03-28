const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

const createOrder = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { items } = req.body;
        const shop = await Shop.findById(shopId);

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        let totalAmount = 0;
        const orderItems = [];  

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order items are required' });
        }

        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
            }

            if (product.shop.toString() !== shopId) {
                return res.status(400).json({ message: `Product with ID ${item.productId} does not belong to the specified shop` });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.price
            });
        }

        const order = new Order({
            customer: req.user._id,
            shop: shop._id,
            items: orderItems,
            totalAmount
        });

        await order.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder };


