const User = require('../models/User');

exports.setInvitationSetting = async (req, res) => {
    try {
        const { weddingDate, sendBeforeDays } = req.body;

        console.log("Wedding Date:", weddingDate);
        console.log("Send Before Days:", sendBeforeDays);
        console.log("User ID:", req.user.id);

        const user = await User.findById(req.user.id);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.invitationSetting = { weddingDate, sendBeforeDays };
        await user.save();

        res.status(200).json({ success: true, message: 'Saved successfully' });
    } catch (error) {
        console.error("Error in setInvitationSetting:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
