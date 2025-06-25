const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// Get all notifications for the authenticated user
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.email 
    })
    .sort({ timestamp: -1 }) // Sort by most recent first
    .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a new notification
router.post('/', authMiddleware(), async (req, res) => {
  try {
    const { userId, firId, title, message, type } = req.body;
    
    const notification = new Notification({
      userId,
      firId,
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date()
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification(s) as read
router.patch('/mark-read', authMiddleware(), async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds must be an array' });
    }

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: req.user.email // Only update user's own notifications
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authMiddleware(), async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.email },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete a notification (optional - if you want to let users delete notifications)
router.delete('/:id', authMiddleware(), async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.email
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.remove();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;
