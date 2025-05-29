const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
    updateUserProfile,
    getUserEvents,
    updateVendorSetup, 
    updateVendorAvailability,
    addServiceDetails,
    addPackage,
    addMainTask,
    getTasks,
    addSubtask,
    getSubtasks,
    deleteSubtask
} = require('../controllers/userController');

// Get user profile
router.get('/profile', protect, (req, res) => {
    res.json({ user: req.user });
});

// Update base profile (name/email/phone)
router.put('/update-profile', protect, updateUserProfile);

// Update vendor-specific setup (business name, address, socials)
router.put('/vendor-setup', protect, authorize('vendor'), updateVendorSetup);

router.put('/vendor-availability', protect, authorize('vendor'), updateVendorAvailability);

router.post('/add-service', protect, authorize('vendor'), addServiceDetails);

router.post('/package', protect, authorize('vendor'), addPackage);

// CUSTOMER TASK ROUTES
router.post('/task', protect, authorize('customer'), addMainTask);
router.get('/task', protect, authorize('customer'), getTasks);
// Corrected version:
router.post('/task/:taskIndex/subtask', protect, authorize('customer'), addSubtask);

router.get('/task/:index/subtasks', protect, authorize('customer'), getSubtasks);

router.delete('/task/:taskIndex/subtask/:subtaskIndex', protect, authorize('customer'), deleteSubtask);

// Optional: vendor-only route
router.get('/vendor-dashboard', protect, authorize('vendor'), (req, res) => {
    res.json({ message: `Welcome, vendor ${req.user.email}` });
});

module.exports = router;
