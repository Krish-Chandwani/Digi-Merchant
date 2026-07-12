const generateWhatsappLink = (phoneNumber, order,productsMap) => {
    let message=`Hello I want to place an order .%0A%0A`
    message+=`🧾 Order ID: ${order._id}%0A`;
    message += `📦 Items:%0A`;

    order.items.forEach((item) => {
        const productName = productsMap[item.product.toString()] || 'Product';
        message += `- ${productName} x${item.quantity} = ₹${item.priceAtPurchase * item.quantity}%0A`;
    });

    message += `%0A💰 Total: ₹${order.totalAmount}%0A`;
    message += `📌 Status: ${order.status}`;

    return `https://wa.me/91${phoneNumber}?text=${message}`;
};

module.exports = generateWhatsappLink;
