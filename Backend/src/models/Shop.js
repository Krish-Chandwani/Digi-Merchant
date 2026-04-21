const mongoose = require('mongoose');

const shopsSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true,
        trim: true
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    address:{
        type: String,
        required: true,
        trim: true
    },

    whatsappNumber:{
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Enter valid 10-digit number"]
    },

    isOpen:{
        type: Boolean,
        default: true
    },

    logo:{
        type: String,
        default: ""
    },

    banner:{
        type: String,
        default: ""
    },

    description:{
        type: String,
        default: "",
        trim: true
    },

    category:{
        type: String,
        default: ""
    }

}, { timestamps: true });


shopsSchema.index({ name: 1 });
shopsSchema.index({ category: 1 });
shopsSchema.index({ isOpen: 1 });
shopsSchema.index({ createdAt: -1 });

shopsSchema.index({ name: "text", description: "text" });

const ShopModel = mongoose.model('Shop', shopsSchema);

module.exports = ShopModel;