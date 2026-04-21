const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: "",
        trim: true
    },

    price: {    
        type: Number,
        required: true,
        min: 0
    },

    stock: {
        type: Number,
        required: true,
        min: 0
    },

    category: {
        type: String,
        required: true
    },

    images: [
        {
            type: String 
        }
    ],

    thumbnail: {
        type: String,
        default: ""
    },

    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }

}, { timestamps: true });


productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ shop: 1 });
productSchema.index({ createdAt: -1 });

productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;