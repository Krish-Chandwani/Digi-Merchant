const Shop=require('../models/Shop');

async function createShop(req,res){
    try {
        const { name, address, whatsappNumber, logo } = req.body;
        const owner = req.user.id;
        const shop = new Shop({
            name,
            address,
            whatsappNumber,
            logo,
            owner
        });
        await shop.save();
        res.status(201).json({
            message: 'Shop created successfully',
            shop
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getShops(req,res){
    try {
        const shops = await Shop.find().populate('owner', 'name email');
        res.status(200).json({
            message: 'Shops retrieved successfully',
            shops
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getShopById(req,res){
    try {
        const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        res.status(200).json({
            message: 'Shop retrieved successfully',
            shop
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createShop, getShops, getShopById };