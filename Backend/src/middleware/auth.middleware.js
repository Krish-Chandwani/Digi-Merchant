const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // console.log("AUTH HEADER:", req.headers.authorization);

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // console.log("EXTRACTED TOKEN:", token);
    // console.log("JWT SECRET:", process.env.JWT_SECRET);

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("DECODED TOKEN:", decoded);

    req.user = await User.findById(decoded.id);
    // console.log("USER FOUND:", req.user);

    next();
  } catch (error) {
    // console.log("JWT ERROR:", error.message);
    res.status(401).json({ message: 'Token failed' });
  }
};

exports.isMerchant = (req, res, next) => {
  console.log("USER ROLE:", req.user?.role);

  if (req.user.role !== 'merchant') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};