const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Route to create a new notification
router.post('/create', async (req, res) => {
    const { title, message } = req.body;
    const user = req.user._id;  // Assuming you have user info in req.user

    try {
        const notification = new Notification({
            title,
            message,
            user,
        });
        await notification.save();
        res.status(200).send(notification);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to fetch notifications for a user
router.get('/fetch', async (req, res) => {
    const user = req.user._id;

    try {
        const notifications = await Notification.find({ user, isRead: false });
        res.status(200).send(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to mark a notification as read
router.post('/mark-read/:id', async (req, res) => {
    const notificationId = req.params.id;

    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).send('Notification not found');
        }
        res.status(200).send(notification);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
