const Guest = require('../models/Guest');
const User = require('../models/User'); // Make sure this is imported

// ➕ Add a new guest
exports.addGuest = async (req, res) => {
    try {
        const { name, side, phone, category } = req.body;

        const guest = await Guest.create({
            user: req.user.id,
            name,
            side,
            phone,
            category,
        });

        const link = `${process.env.CLIENT_URL}/invite/${guest._id}`;

        res.status(201).json({
            success: true,
            guest,
            invitationLink: link
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// 📥 Get all guests with invitationSent flag
exports.getGuests = async (req, res) => {
    try {
        const guests = await Guest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, guests }); // Make sure it sends guests
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ Mark selected guests as invitation sent
exports.sendInvitations = async (req, res) => {
    try {
        const { guestIds } = req.body;

        if (!Array.isArray(guestIds)) {
            return res.status(400).json({ success: false, message: 'guestIds must be an array' });
        }

        await Guest.updateMany(
            { _id: { $in: guestIds }, user: req.user.id },
            { $set: { invitationSent: true } }
        );

        res.status(200).json({ success: true, message: 'Invitations sent successfully' });
    } catch (err) {
        console.error('Error in sendInvitations:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ✅ Update guest details
exports.updateGuest = async (req, res) => {
    try {
        const { guestId } = req.params;
        console.log('User ID:', req.user.id);
        console.log('Guest ID:', guestId);

        const guest = await Guest.findOne({ _id: guestId, user: req.user.id });

        if (!guest) {
            console.log('Guest not found or user mismatch');
            return res.status(404).json({ success: false, message: 'Guest not found' });
        }

        // Update fields
        if (req.body.name !== undefined) guest.name = req.body.name;
        if (req.body.phone !== undefined) guest.phone = req.body.phone;
        if (req.body.side !== undefined) guest.side = req.body.side;
        if (req.body.category !== undefined) guest.category = req.body.category;

        await guest.save();
        res.status(200).json({ success: true, guest });

    } catch (error) {
        console.error('Update Guest Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// ❌ Delete a guest
