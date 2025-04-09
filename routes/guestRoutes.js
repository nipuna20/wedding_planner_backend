const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const guestController = require('../controllers/guestController');

// Existing routes
router.post('/add', protect, guestController.addGuest);
router.get('/', protect, guestController.getGuests);

// 🔥 Add this route
router.post('/send-invitations', protect, guestController.sendInvitations);

module.exports = router;
