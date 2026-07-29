/**
 * Seed dummy customers, merchants, shops, and products.
 * Password for all users: krish@1234
 *
 * Usage (from Backend/):
 *   node src/scripts/seedDummyData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

const PASSWORD = 'krish@1234';

const img = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const CUSTOMERS = [
  { name: 'Aarav Mehta', email: 'aarav.mehta.demo@gmail.com' },
  { name: 'Priya Sharma', email: 'priya.sharma.demo@gmail.com' },
  { name: 'Rohan Patel', email: 'rohan.patel.demo@gmail.com' },
  { name: 'Ananya Iyer', email: 'ananya.iyer.demo@gmail.com' },
  { name: 'Kabir Singh', email: 'kabir.singh.demo@gmail.com' }
];

const MERCHANTS = [
  {
    name: 'Neha Kapoor',
    email: 'neha.kapoor.demo@gmail.com',
    shops: [
      {
        name: 'Green Basket Groceries',
        address: '12 MG Road, Andheri West, Mumbai',
        whatsappNumber: '9876501001',
        category: 'Grocery',
        description: 'Fresh veggies, fruits, and daily essentials.',
        latitude: 19.1364,
        longitude: 72.8277,
        logo: img('photo-1542838132-92c53300491e', 400),
        banner: img('photo-1542838132-92c53300491e', 1200),
        products: [
          {
            name: 'Organic Tomatoes 1kg',
            price: 60,
            stock: 40,
            category: 'Vegetables',
            description: 'Farm-fresh organic tomatoes',
            image: img('photo-1546470427-e26264be0d19')
          },
          {
            name: 'Basmati Rice 5kg',
            price: 450,
            stock: 25,
            category: 'Staples',
            description: 'Premium aged basmati rice',
            image: img('photo-1586201375761-83865001e31c')
          },
          {
            name: 'Fresh Milk 1L',
            price: 58,
            stock: 50,
            category: 'Dairy',
            description: 'Full cream milk',
            image: img('photo-1563636619-e9143da7973b')
          },
          {
            name: 'Brown Bread',
            price: 45,
            stock: 30,
            category: 'Bakery',
            description: 'Whole wheat bread loaf',
            image: img('photo-1509440159596-0249088772ff')
          }
        ]
      },
      {
        name: 'Daily Needs Corner',
        address: '45 Linking Road, Bandra, Mumbai',
        whatsappNumber: '9876501002',
        category: 'General Store',
        description: 'Snacks, drinks, and household items.',
        latitude: 19.0596,
        longitude: 72.8295,
        logo: img('photo-1604719312566-8912e9227c6a', 400),
        banner: img('photo-1578916171728-46686eac8d58', 1200),
        products: [
          {
            name: 'Potato Chips Pack',
            price: 20,
            stock: 100,
            category: 'Snacks',
            description: 'Crispy salted chips',
            image: img('photo-1566478989032-a56480ece361')
          },
          {
            name: 'Mineral Water 1L',
            price: 20,
            stock: 80,
            category: 'Beverages',
            description: 'Packaged drinking water',
            image: img('photo-1548832336-ea721c384095')
          },
          {
            name: 'Dishwash Liquid 500ml',
            price: 99,
            stock: 35,
            category: 'Household',
            description: 'Lemon fragrance',
            image: img('photo-1583947215259-38e31be8751f')
          }
        ]
      }
    ]
  },
  {
    name: 'Vikram Desai',
    email: 'vikram.desai.demo@gmail.com',
    shops: [
      {
        name: 'TechFix Electronics',
        address: '88 FC Road, Pune',
        whatsappNumber: '9876502001',
        category: 'Electronics',
        description: 'Gadgets, accessories, and phone care.',
        latitude: 18.5285,
        longitude: 73.8434,
        logo: img('photo-1519389950473-47ba0277781c', 400),
        banner: img('photo-1498049794561-7780e7231661', 1200),
        products: [
          {
            name: 'USB-C Fast Charger',
            price: 499,
            stock: 45,
            category: 'Accessories',
            description: '25W Type-C charger',
            image: img('photo-1583863788434-e58a36330cf0')
          },
          {
            name: 'Bluetooth Earbuds',
            price: 1299,
            stock: 20,
            category: 'Audio',
            description: 'Noise isolation earbuds',
            image: img('photo-1590658268037-6bf12165a8df')
          },
          {
            name: 'Tempered Glass Pack',
            price: 199,
            stock: 60,
            category: 'Accessories',
            description: 'Fits popular phones',
            image: img('photo-1511707171634-5f897ff02aa9')
          },
          {
            name: 'Power Bank 10000mAh',
            price: 1499,
            stock: 15,
            category: 'Power',
            description: 'Dual port power bank',
            image: img('photo-1609091839311-b9b16adf7850')
          }
        ]
      }
    ]
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.reddy.demo@gmail.com',
    shops: [
      {
        name: 'Spice Route Kitchen',
        address: '22 Jubilee Hills, Hyderabad',
        whatsappNumber: '9876503001',
        category: 'Food',
        description: 'Homestyle meals and spice mixes.',
        latitude: 17.4326,
        longitude: 78.4071,
        logo: img('photo-1596040033229-a9821ebd058d', 400),
        banner: img('photo-1596797038530-2c107229654b', 1200),
        products: [
          {
            name: 'Garam Masala 100g',
            price: 85,
            stock: 40,
            category: 'Spices',
            description: 'House blend spice mix',
            image: img('photo-1596040033229-a9821ebd058d')
          },
          {
            name: 'Idli Batter 1kg',
            price: 70,
            stock: 25,
            category: 'Ready to Cook',
            description: 'Fresh fermented batter',
            image: img('photo-1589301760014-d929f3979dbc')
          },
          {
            name: 'Sambar Powder 200g',
            price: 95,
            stock: 30,
            category: 'Spices',
            description: 'Authentic Andhra blend',
            image: img('photo-1506368249639-73a05d6f6488')
          }
        ]
      },
      {
        name: 'Bloom & Petal Florist',
        address: '5 Banjara Hills Road, Hyderabad',
        whatsappNumber: '9876503002',
        category: 'Florist',
        description: 'Bouquets and gift hampers.',
        latitude: 17.4156,
        longitude: 78.4347,
        logo: img('photo-1490750967868-88aa4486c946', 400),
        banner: img('photo-1487530811176-3780de880c2d', 1200),
        products: [
          {
            name: 'Red Rose Bouquet',
            price: 599,
            stock: 12,
            category: 'Bouquets',
            description: '12 fresh roses',
            image: img('photo-1518709268805-4e9042af9f23')
          },
          {
            name: 'Mixed Flower Basket',
            price: 899,
            stock: 8,
            category: 'Bouquets',
            description: 'Seasonal mixed flowers',
            image: img('photo-1563241527-3004b7be0ffd')
          },
          {
            name: 'Succulent Pot',
            price: 349,
            stock: 18,
            category: 'Plants',
            description: 'Mini indoor plant',
            image: img('photo-1459156212016-c8128e77e2c6')
          }
        ]
      }
    ]
  }
];

async function upsertUser({ name, email, role, passwordHash }) {
  let user = await User.findOne({ email });
  if (user) {
    user.name = name;
    user.role = role;
    user.password = passwordHash;
    await user.save();
    return { user, created: false };
  }

  user = await User.create({
    name,
    email,
    role,
    password: passwordHash
  });
  return { user, created: true };
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI missing in Backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  console.log('\n--- Customers ---');
  for (const c of CUSTOMERS) {
    const { user, created } = await upsertUser({
      ...c,
      role: 'customer',
      passwordHash
    });
    console.log(`${created ? 'Created' : 'Updated'} customer: ${user.email}`);
  }

  console.log('\n--- Merchants, shops & products ---');
  for (const m of MERCHANTS) {
    const { user, created } = await upsertUser({
      name: m.name,
      email: m.email,
      role: 'merchant',
      passwordHash
    });
    console.log(`${created ? 'Created' : 'Updated'} merchant: ${user.email}`);

    for (const shopData of m.shops) {
      let shop = await Shop.findOne({ name: shopData.name, owner: user._id });

      const location = {
        type: 'Point',
        coordinates: [shopData.longitude, shopData.latitude]
      };

      if (shop) {
        shop.address = shopData.address;
        shop.whatsappNumber = shopData.whatsappNumber;
        shop.category = shopData.category;
        shop.description = shopData.description;
        shop.isOpen = true;
        shop.location = location;
        shop.logo = shopData.logo;
        shop.banner = shopData.banner;
        await shop.save();
        console.log(`  Updated shop: ${shop.name}`);
      } else {
        shop = await Shop.create({
          name: shopData.name,
          owner: user._id,
          address: shopData.address,
          whatsappNumber: shopData.whatsappNumber,
          category: shopData.category,
          description: shopData.description,
          isOpen: true,
          location,
          logo: shopData.logo,
          banner: shopData.banner
        });
        console.log(`  Created shop: ${shop.name}`);
      }

      for (const p of shopData.products) {
        const image = p.image;
        let product = await Product.findOne({ name: p.name, shop: shop._id });

        if (product) {
          product.price = p.price;
          product.stock = p.stock;
          product.category = p.category;
          product.description = p.description;
          product.images = [image];
          product.thumbnail = image;
          await product.save();
          console.log(`    Updated product: ${product.name}`);
        } else {
          product = await Product.create({
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            category: p.category,
            shop: shop._id,
            images: [image],
            thumbnail: image
          });
          console.log(`    Created product: ${product.name}`);
        }
      }
    }
  }

  console.log('\nDone. Login password for all seeded users: krish@1234');
  console.log('\nSample logins:');
  console.log('  Customer: aarav.mehta.demo@gmail.com');
  console.log('  Merchant: neha.kapoor.demo@gmail.com');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
