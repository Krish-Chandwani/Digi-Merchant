const Shop=require('../models/Shop');
const { countDocuments } = require('../models/User');

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

async function getAllShops(req,res){
    try {
        const shops = await Shop.find({ isOpen: true }).populate('owner', 'name email');
        res.status(200).json({
            message: 'Shops retrieved successfully',
            shops,
            count: shops.length
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

async function updateShop(req,res){
    try {
        const { name, address, whatsappNumber, logo } = req.body;
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        if(shop.owner.toString() !== req.user.id){
            return res.status(403).json({ message: 'Access denied' });
        }   
        
        if(name) shop.name = name;
        if(address) shop.address = address;
        if(whatsappNumber) shop.whatsappNumber = whatsappNumber;
        if(logo) shop.logo = logo;

        await shop.save();
        res.status(200).json({
            message: 'Shop updated successfully',
            shop
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteShop(req,res){
    try {
        const shop = await Shop.findById(req.params.id);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        if(shop.owner.toString() !== req.user.id){
            return res.status(403).json({ message: 'Access denied' });
        }

        // Soft delete: mark as inactive instead of removing the record
        shop.isOpen = false;
        await shop.save();

        res.status(200).json({
            message: 'Shop deactivated successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createShop, getShops, getAllShops, getShopById, updateShop, deleteShop };