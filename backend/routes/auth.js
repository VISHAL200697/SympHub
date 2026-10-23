import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../auth.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'symposium_super_secret_jwt_key_2026_mern_version',
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// @desc    Register a new user (defaults to student)
// @route   POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email address is already registered.' });
    }

    const assignedRole = role || 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      department,
      role: assignedRole,
      is_active: true,
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      is_active: user.is_active,
      created_at: user.createdAt,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ detail: error.message || 'Server error during signup.' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ detail: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ detail: 'Account is deactivated. Please contact administrator.' });
    }

    const access_token = generateToken(user._id, user.role);

    return res.json({
      access_token,
      token_type: 'bearer',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        is_active: user.is_active,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ detail: error.message || 'Server error during login.' });
  }
});

// @desc    Get current authenticated user profile
// @route   GET /auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      is_active: req.user.is_active,
      created_at: req.user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ detail: 'Error fetching user profile.' });
  }
});

export default router;
