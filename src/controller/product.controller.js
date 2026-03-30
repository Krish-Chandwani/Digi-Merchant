const Product=require('../models/Product');
const Shop=require('../models/Shop');
// const { find, countDocuments } = require('../models/User');

async function createProduct(req,res){
    try {
        const { name, price, stock, category, image } = req.body;
        const shopId = req.params.shopId;
        
        const shop=await Shop.findById(shopId);
        
        if(!shop){
            return res.status(404).json({ message: 'Shop not found' });
        }

        if(shop.owner.toString() !== req.user.id){
            return res.status(403).json({ message: 'Access denied' });
        }

        const product = new Product({
            name,
            price,
            stock,
            category,
            image,
            shop: shopId
        });

        await product.save();

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function getProductsByShop(req,res){
    try {
        const shopId = req.params.shopId;
        const products = await Product.find({ shop: shopId });
        res.status(200).json({
            message: 'Products retrieved successfully',
            products,
            count: products.length
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function updateProduct(req,res){
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }
        if (shop.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, price, stock, category, image } = req.body;
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.shop.toString() !== req.params.shopId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (category) product.category = category;
        if (image) product.image = image;

        await product.save();
        res.status(200).json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

async function deleteProduct(req,res){
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        if (shop.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }   

        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.shop.toString() !== req.params.shopId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await product.remove();
        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createProduct, getProductsByShop, updateProduct, deleteProduct };
