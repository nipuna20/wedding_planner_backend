const User = require('../models/User');

// GET /api/user/profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Failed to load profile" });
    }
};

// PUT /api/user/update-profile
const updateUserProfile = async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        await user.save();
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Profile update failed" });
    }
};


// Update vendor profile
const updateVendorSetup = async (req, res) => {
    try {
        const updates = {
            businessName: req.body.businessName,
            address: req.body.address,
            instagram: req.body.instagram,
            facebook: req.body.facebook,
            youtube: req.body.youtube,
        };

        const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
        });

        res.status(200).json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('Vendor profile setup error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update unavailable dates for vendor
const updateVendorAvailability = async (req, res) => {
    const { unavailableDates } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.unavailableDates = unavailableDates;
    await user.save();

    res.json({ message: 'Availability updated successfully' });
};

const addServiceDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            serviceName,
            serviceType,
            description,
            paymentPolicy,
            mediaUrls = [], // optional if file upload not handled yet
        } = req.body;

        const user = await User.findById(userId);

        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Only vendors can add services' });
        }

        user.serviceDetails.push({
            serviceName,
            serviceType,
            description,
            paymentPolicy,
            mediaUrls,
        });

        await user.save();

        res.status(200).json({ message: 'Service details added successfully' });
    } catch (error) {
        console.error('Add service error:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const addPackage = async (req, res) => {
    try {
        const { packageName, packagePrice, description } = req.body;

        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        user.packages.push({ packageName, packagePrice, description });

        await user.save();

        res.status(201).json({ success: true, message: 'Package added successfully' });
    } catch (err) {
        console.error('Add package error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Add a new main task for a customer
const addMainTask = async (req, res) => {
    try {
        const { name, timeline, deadline } = req.body;
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'customer') {
            return res.status(403).json({ message: 'Unauthorized: Only customers can add tasks.' });
        }

        const newTask = {
            name,
            timeline,
            deadline,
            subtasks: []
        };

        user.tasks.push(newTask);
        await user.save();

        res.status(201).json({ message: 'Task added successfully', task: newTask });
    } catch (error) {
        console.error('Add main task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all tasks for logged-in customer
const getTasks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'customer') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.status(200).json({ tasks: user.tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add subtask to a specific main task by index
const addSubtask = async (req, res) => {
    try {
        const taskIndex = parseInt(req.params.taskIndex);
        const { title } = req.body;
        const user = await User.findById(req.user._id);

        console.log("✅ Found user:", user.name);
        console.log("🔢 Index received:", taskIndex);
        console.log("🧾 Tasks array length:", user.tasks.length);

        if (!user.tasks[taskIndex]) {
            return res.status(404).json({ message: 'Task not found' });
        }

        user.tasks[taskIndex].subtasks.push({ title });
        await user.save();

        res.status(200).json({
            message: 'Subtask added successfully',
            task: user.tasks[taskIndex],
        });
    } catch (error) {
        console.error('Add subtask error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/user/task/:index/subtasks
const getSubtasks = async (req, res) => {
    try {
        const taskIndex = req.params.index;
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'customer') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const task = user.tasks[taskIndex];
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ subtasks: task.subtasks });
    } catch (error) {
        console.error('Get subtasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteSubtask = async (req, res) => {
    try {
        const { taskIndex, subtaskIndex } = req.params;
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'customer') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!user.tasks[taskIndex]) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (!user.tasks[taskIndex].subtasks[subtaskIndex]) {
            return res.status(404).json({ message: 'Subtask not found' });
        }

        user.tasks[taskIndex].subtasks.splice(subtaskIndex, 1);
        await user.save();

        res.status(200).json({ message: 'Subtask deleted successfully' });
    } catch (error) {
        console.error('Delete subtask error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};





module.exports = { getUserProfile, updateUserProfile, updateVendorSetup, updateVendorAvailability, addServiceDetails, addPackage, addSubtask, addMainTask, getTasks, getSubtasks, deleteSubtask };
