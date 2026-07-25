const Shop = require('../models/Shop');
const cloudinary = require('../config/cloudinary');
const { notifyCustomersNewShop } = require('../utils/emailNotifications');

async function uploadToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'digi-merchant' }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      })
      .end(fileBuffer);
  });
}

function parseLocation(body) {
  const hasLat = body.latitude !== undefined && body.latitude !== null;
  const hasLng = body.longitude !== undefined && body.longitude !== null;

  if (!hasLat && !hasLng) {
    return undefined; // omit — do not change on update
  }

  if (body.latitude === '' && body.longitude === '') {
    return null; // clear pin
  }

  const lat = Number(body.latitude);
  const lng = Number(body.longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const err = new Error('latitude and longitude must be valid numbers');
    err.status = 400;
    throw err;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const err = new Error('Invalid coordinates');
    err.status = 400;
    throw err;
  }

  return {
    type: 'Point',
    coordinates: [lng, lat]
  };
}

async function createShop(req, res) {
  try {
    const { name, address, whatsappNumber, category, description } = req.body;

    let logo = '';
    let banner = '';

    if (req.files?.logo) {
      logo = await uploadToCloudinary(req.files.logo[0].buffer);
    }

    if (req.files?.banner) {
      banner = await uploadToCloudinary(req.files.banner[0].buffer);
    }

    const location = parseLocation(req.body);

    const shopData = {
      name,
      address,
      whatsappNumber,
      category,
      description,
      owner: req.user.id,
      logo,
      banner
    };

    if (location) {
      shopData.location = location;
    }

    const shop = new Shop(shopData);
    await shop.save();

    notifyCustomersNewShop(shop);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      shop
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
}

async function getShops(req, res) {
  try {
    const shops = await Shop.find({ owner: req.user.id }).populate(
      'owner',
      'name email'
    );
    res.status(200).json({
      message: 'Shops retrieved successfully',
      shops
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getAllShops(req, res) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const maxDistanceKm = Number(req.query.maxDistanceKm) || 15;

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({ message: 'Invalid coordinates' });
      }

      const radiusKm = Math.min(Math.max(maxDistanceKm, 1), 100);

      const results = await Shop.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distanceMeters',
            maxDistance: radiusKm * 1000,
            spherical: true,
            query: { isOpen: true }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'ownerDocs',
            pipeline: [{ $project: { name: 1, email: 1 } }]
          }
        },
        {
          $addFields: {
            owner: { $arrayElemAt: ['$ownerDocs', 0] },
            distanceKm: {
              $round: [{ $divide: ['$distanceMeters', 1000] }, 1]
            }
          }
        },
        { $project: { ownerDocs: 0, distanceMeters: 0 } }
      ]);

      return res.status(200).json({
        message: 'Nearby shops retrieved successfully',
        shops: results,
        count: results.length,
        maxDistanceKm: radiusKm
      });
    }

    const shops = await Shop.find({ isOpen: true }).populate(
      'owner',
      'name email'
    );
    res.status(200).json({
      message: 'Shops retrieved successfully',
      shops,
      count: shops.length
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getShopById(req, res) {
  try {
    const shop = await Shop.findById(req.params.id).populate(
      'owner',
      'name email'
    );
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
    if (req.body.isOpen !== undefined) {
      shop.isOpen = req.body.isOpen === true || req.body.isOpen === 'true';
    }

    const location = parseLocation(req.body);
    if (location === null) {
      shop.$unset('location');
    } else if (location) {
      shop.location = location;
    }

    await shop.save();

    res.status(200).json({
      message: 'Shop updated successfully',
      shop
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  }
}

async function deleteShop(req, res) {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }
    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    shop.isOpen = false;
    await shop.save();

    res.status(200).json({
      message: 'Shop deactivated successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  createShop,
  getShops,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop
};
