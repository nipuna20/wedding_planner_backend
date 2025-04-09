const Event = require('../models/Event');

// Add Event
exports.addEvent = async (req, res) => {
    try {
        const { name, date } = req.body;
        const event = await Event.create({
            user: req.user.id,
            name,
            date,
        });
        res.status(201).json({ success: true, event });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Events for logged-in user
exports.getUserEvents = async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id }).sort({ date: 1 });
        res.status(200).json({ success: true, events });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
