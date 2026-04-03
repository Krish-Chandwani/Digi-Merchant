const mongoose = require('mongoose');

const shopsSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address:{
        type: String,
        required: true
    },
    whatsappNumber:{
        type: String,
        required: true
    },
    isOpen:{
        type: Boolean,
        default: true
    },
    logo:{
        type: String
    }
}, 
{ timestamps: true });

const ShopModel = mongoose.model('Shop', shopsSchema);

module.exports = ShopModel;
