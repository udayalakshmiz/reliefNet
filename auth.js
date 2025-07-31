import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export default async function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log("🔐 Incoming token:", token);
  if (!token) return res.status(401).send({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Decoded JWT:", decoded);
    const user = await User.findById(decoded.id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error('JWT error:', err);
    res.status(400).send({ error: 'Invalid token.' });
  }
}
