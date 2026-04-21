const Product=require('../models/Product');
const Shop=require('../models/Shop');
// const { find, countDocuments } = require('../models/User');

async function createProduct(req, res) {
  try {
    const { name, price, stock, category } = req.body;
    const shopId = req.params.shopId;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const product = new Product({
      name,
      price,
      stock,
      category,
      shop: shopId,
      images: imageUrls,
      thumbnail: imageUrls[0] || ""
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getProductsByShop(req, res) {
  try {
    const { shopId } = req.params;
    const { search, category, inStock, sort, page = 1, limit = 5 } = req.query;

    let filter = { shop: shopId };
    let sortOption = {};

    // search by product name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // filter by category
    if (category) {
      filter.category = category;
    }

    // filter only in-stock products
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // sorting logic
    if (sort === 'price_asc') {
      sortOption.price = 1;
    } else if (sort === 'price_desc') {
      sortOption.price = -1;
    } else if (sort === 'newest') {
      sortOption.createdAt = -1;
    }

    // pagination values
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // total products count
    const totalProducts = await Product.countDocuments(filter);

    // fetch paginated products
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      page: pageNumber,
      limit: limitNumber,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNumber),
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function updateProduct(req, res) {
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

    if (product.shop.toString() !== shopId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, price, stock, category } = req.body;

    if (name) product.name = name;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category) product.category = category;

    if (req.files && req.files.length > 0) {
      const imageUrls = req.files.map(file => file.path);
      product.images = imageUrls;
      product.thumbnail = imageUrls[0];
    }

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
        await product.deleteOne();
        res.status(200).json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createProduct, getProductsByShop, updateProduct, deleteProduct };
