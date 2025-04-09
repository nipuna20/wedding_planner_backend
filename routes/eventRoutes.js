const express = require('express');
const router = express.Router();
const { addEvent, getUserEvents } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addEvent);
router.get('/my-events', protect, getUserEvents);

module.exports = router;
