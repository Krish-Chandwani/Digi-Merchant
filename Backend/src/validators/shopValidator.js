const { body } = require('express-validator');

exports.createShopValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Shop name is required'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('whatsappNumber')
    .trim()
    .notEmpty()
    .withMessage('WhatsApp number is required'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
];

