const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const generateWhatsappLink = require('../utils/generateWhatsappLink');

async function createOrder(req, res) {
  try {
    const { shopId } = req.params;
    const { items } = req.body;

    // check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    let totalAmount = 0;
    const orderItems = [];
    const productsMap = {};

    const productsToUpdate = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.shop.toString() !== shopId) {
        return res.status(400).json({
          message: `Product ${product.name} does not belong to this shop`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });

      productsMap[product._id.toString()] = product.name;

      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // deduct stock after validation passes
    for (let item of productsToUpdate) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      shop: shopId,
      items: orderItems,
      totalAmount
    });

    const whatsappLink = generateWhatsappLink(shop.whatsappNumber, order, productsMap);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      whatsappLink
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function getMyOrders(req, res) {
    try {
        const orders = await Order.find({ customer: req.user._id }).populate('shop','name address whatsappNumber').populate('items.product','name price image').sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Customer Orders retrieved successfully',
            orders,
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getShopOrders(req, res) {
    try {
        const shopId = req.params.shopId;
        if (!shopId) {
            return res.status(400).json({ message: 'Shop ID is required' });
        }
        const orders = await Order.find({ shop: shopId }).populate('customer', 'name email').populate('items.product', 'name price image').sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Shop Orders retrieved successfully',
            orders,
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const {shopId, orderId } = req.params;
        const { status } = req.body;

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        if(shop.owner.toString() !== req.user._id.toString()){
            return res.status(403).json({ message: 'Unauthorized to update order status for this shop' });
        }

        const order = await Order.findOne({ _id: orderId, shop: shopId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const validStatuses = ['pending', 'accepted', 'delivered', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createOrder, getMyOrders, getShopOrders, updateOrderStatus };

