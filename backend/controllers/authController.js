import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Business from '../models/Business.js';

const generateToken = (id, businessId) => {
  return jwt.sign(
    { id, businessId },
    process.env.JWT_SECRET || 'recoverai_super_secure_jwt_token_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new business and admin user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, businessName } = req.body;

  if (!name || !email || !password || !businessName) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Create Business tenant
  const business = await Business.create({
    name: businessName,
    legalName: businessName,
    email: email
  });

  // Create primary user
  const user = await User.create({
    businessId: business._id,
    name,
    email,
    password,
    role: 'Finance Director'
  });

  const token = generateToken(user._id, business._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    business: {
      id: business._id,
      name: business.name
    }
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password credentials' });
  }

  const business = await Business.findById(user.businessId);
  const token = generateToken(user._id, user.businessId);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    },
    business: business || { id: user.businessId, name: 'Default Business' }
  });
};

// @desc    Get current logged in user & business profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  const business = await Business.findById(req.businessId);

  res.json({
    success: true,
    user,
    business
  });
};
