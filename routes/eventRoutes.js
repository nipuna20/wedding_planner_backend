const express = require('express');
const router = express.Router();
const { addEvent, getUserEvents, getEventById, deleteEvent, updateEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addEvent);
router.get('/my-events', protect, getUserEvents);
router.get('/:id', protect, getEventById);
router.delete('/:eventId', protect, deleteEvent); // Adjusted to match controller
router.put('/:eventId', protect, updateEvent); // Adjusted to match controller

module.exports = router;