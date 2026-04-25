const Shop=require('../models/Shop');
const { countDocuments } = require('../models/User');

const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "digi-merchant" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
}

async function createShop(req, res) {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { name, address, whatsappNumber, category, description } = req.body;

    let logo = "";
    let banner = "";

    if (req.files?.logo) {
      logo = await uploadToCloudinary(req.files.logo[0].buffer);
    }

    if (req.files?.banner) {
      banner = await uploadToCloudinary(req.files.banner[0].buffer);
    }

    const shop = new Shop({
      name,
      address,
      whatsappNumber,
      category,
      description,
      owner: req.user.id,
      logo,
      banner
    });

    await shop.save();

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shop
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function getShops(req,res){
    try {
        const shops = await Shop.find({owner: req.user.id}).populate('owner', 'name email');
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

async function updateShop(req, res) {
  try {
    const { name, address, whatsappNumber, category, description } = req.body;

    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.files?.logo) {
      const logoUrl = await uploadToCloudinary(req.files.logo[0].buffer);
      shop.logo = logoUrl;
    }

    if (req.files?.banner) {
      const bannerUrl = await uploadToCloudinary(req.files.banner[0].buffer);
      shop.banner = bannerUrl;
    }

    if (name) shop.name = name;
    if (address) shop.address = address;
    if (whatsappNumber) shop.whatsappNumber = whatsappNumber;
    if (category) shop.category = category;
    if (description) shop.description = description;

    await shop.save();

    res.status(200).json({
      message: 'Shop updated successfully',
      shop
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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