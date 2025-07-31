import ContactMessage from '../models/contactModel.js';

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();
    res.status(201).json({ message: 'Your message has been received successfully!' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Get all messages (Admin view)
export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ submittedAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
