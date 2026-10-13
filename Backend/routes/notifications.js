const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const FIR = require('../models/FIR');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { STAFF_ROLES } = authMiddleware;

const NOTIFICATION_TYPES = ['fir_update', 'assignment', 'message', 'system'];

// Notifications are addressed by email. Tokens issued before the email claim
// was added don't carry it, so fall back to looking the user up.
const getUserEmail = async (req) => {
  if (req.user.email) return req.user.email;
  const user = await User.findById(req.user.id).select('email');
  return user ? user.email : null;
};

// Get all notifications for the authenticated user
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const email = await getUserEmail(req);
    if (!email) return res.json([]);

    const notifications = await Notification.find({
      userId: email
    })
    .sort({ timestamp: -1 }) // Sort by most recent first
    .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a notification about an FIR (officers and admins only).
// The recipient is always the FIR's complainant, never a client-supplied user.
router.post('/', authMiddleware(STAFF_ROLES), async (req, res) => {
  try {
    const { firId, title, message, type } = req.body;

    if (typeof firId !== 'string' || !mongoose.Types.ObjectId.isValid(firId)) {
      return res.status(400).json({ error: 'A valid firId is required' });
    }
    if (typeof title !== 'string' || !title.trim() || title.length > 200 ||
        typeof message !== 'string' || !message.trim() || message.length > 2000) {
      return res.status(400).json({ error: 'title and message are required' });
    }
    if (!NOTIFICATION_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    const fir = await FIR.findById(firId).select('email');
    if (!fir) {
      return res.status(404).json({ error: 'FIR not found' });
    }

    const notification = new Notification({
      userId: fir.email,
      firId,
      title: title.trim(),
      message: message.trim(),
      type,
      isRead: false,
      timestamp: new Date()
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error.message);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification(s) as read
router.patch('/mark-read', authMiddleware(), async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length > 100 ||
        !notificationIds.every(id => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'notificationIds must be an array of IDs' });
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: await getUserEmail(req) // Only update user's own notifications
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error.message);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware(), async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: await getUserEmail(req) },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error.message);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete a notification (optional - if you want to let users delete notifications)
router.delete('/:id', authMiddleware(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const result = await Notification.deleteOne({
      _id: req.params.id,
      userId: await getUserEmail(req)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
