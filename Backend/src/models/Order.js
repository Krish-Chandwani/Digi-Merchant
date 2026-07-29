const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
        required: true
    },
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    items:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceAtPurchase: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    couponCode: {
        type: String,
        default: ''
    },
    status: {   
        type: String,
        enum: ['pending', 'accepted', 'delivered', 'cancelled', 'completed'],
        default: 'pending'
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: ['pending', 'accepted', 'delivered', 'cancelled', 'completed'],
                required: true
            },
            at: {
                type: Date,
                default: Date.now
            }
        }
    ],
    paymentMethod: {
        type: String,
        enum: ['online', 'cod'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String,
        default: ''
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;