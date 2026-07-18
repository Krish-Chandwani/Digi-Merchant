const User = require('../models/User');
const StockAlert = require('../models/StockAlert');
const { sendBulkEmail, sendEmail } = require('./sendEmail');

async function getCustomerEmails() {
  const customers = await User.find({ role: 'customer' }).select('email name');
  return customers.filter((c) => c.email);
}

async function notifyCustomersNewShop(shop) {
  try {
    const customers = await getCustomerEmails();
    const recipients = customers.map((c) => c.email);

    await sendBulkEmail({
      recipients,
      subject: `New shop on Digi-Merchant: ${shop.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #16a34a;">A new shop just joined Digi-Merchant</h2>
          <p><strong>${shop.name}</strong> is now available.</p>
          <p>${shop.description || shop.category || ''}</p>
          <p style="color: #6b7280;">Address: ${shop.address || 'N/A'}</p>
          <p>Open Digi-Merchant to explore their products.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('notifyCustomersNewShop failed:', error.message);
  }
}

async function notifyCustomersNewProduct(shop, product) {
  try {
    const customers = await getCustomerEmails();
    const recipients = customers.map((c) => c.email);

    await sendBulkEmail({
      recipients,
      subject: `New product at ${shop.name}: ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #16a34a;">New product available</h2>
          <p><strong>${product.name}</strong> was added at <strong>${shop.name}</strong>.</p>
          <p>Price: ₹${product.price}</p>
          <p>Category: ${product.category || 'General'}</p>
          <p>Open Digi-Merchant to check it out.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('notifyCustomersNewProduct failed:', error.message);
  }
}

async function notifyStockAlerts(product, shop) {
  try {
    const alerts = await StockAlert.find({
      product: product._id,
      notified: false
    }).populate('user', 'email name');

    for (const alert of alerts) {
      if (!alert.user?.email) continue;

      try {
        await sendEmail({
          to: alert.user.email,
          subject: `Back in stock: ${product.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
              <h2 style="color: #16a34a;">Good news — it's back in stock!</h2>
              <p><strong>${product.name}</strong> at <strong>${shop?.name || 'a shop'}</strong> is available again.</p>
              <p>Price: ₹${product.price}</p>
              <p>Stock: ${product.stock}</p>
              <p>Open Digi-Merchant to order before it sells out.</p>
            </div>
          `
        });

        alert.notified = true;
        await alert.save();
      } catch (error) {
        console.error(`Stock alert email failed for ${alert.user.email}:`, error.message);
      }
    }
  } catch (error) {
    console.error('notifyStockAlerts failed:', error.message);
  }
}

module.exports = {
  notifyCustomersNewShop,
  notifyCustomersNewProduct,
  notifyStockAlerts
};
