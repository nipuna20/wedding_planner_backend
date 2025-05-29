const Event = require('../models/Event');

// Add Event
exports.addEvent = async (req, res) => {
    try {
        const { name, date } = req.body;
        if (!name || !date) {
            return res.status(400).json({ success: false, message: 'Name and date are required' });
        }
        const event = await Event.create({
            user: req.user.id,
            name,
            date: new Date(date), // Ensure date is stored as ISO 8601
        });
        res.status(201).json({ success: true, event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Events for logged-in user
exports.getUserEvents = async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id }).sort({ date: 1 });
        res.status(200).json({ success: true, events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get Event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || event.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }
        res.status(200).json({ success: true, event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event || event.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }
        await event.deleteOne();
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update Event by ID
exports.updateEvent = async (req, res) => {
    try {
        const { name, date } = req.body;
        if (!name || !date) {
            return res.status(400).json({ success: false, message: 'Name and date are required' });
        }
        const event = await Event.findById(req.params.eventId);
        if (!event || event.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Event not found or unauthorized' });
        }
        event.name = name;
        event.date = new Date(date);
        await event.save();
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};