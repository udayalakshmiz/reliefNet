import express from 'express';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, location, role, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name, email, phone, location, role,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request for:', email);

    const user = await User.findOne({ email });
    console.log('User found:', user);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('JWT_SECRET used to sign:', JWT_SECRET); // 🔥

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    console.log('Token generated:', token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Login error:', error); // 🔥 this will show exact issue
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
