import Alert from '../models/alertModel.js';
import User from '../models/userModel.js';

export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAlert = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, type, location, urgency, coordinates, targetAudience } = req.body;

    const newAlert = new Alert({
      title,
      description,
      type,
      location,
      urgency,
      isActive: true,
      createdBy: req.user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      targetAudience
    });

    await newAlert.save();

    const users = await User.find({
      role: { $in: targetAudience },
      'settings.emergencyAlerts': { $ne: false }
    });

    const emailPromises = users.map(user => sendAlertNotification(user.email, user.name, newAlert));
    await Promise.allSettled(emailPromises);

    res.status(201).json({ message: 'Alert created', alert: newAlert });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
