
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

// GET all services from all vendors
const getAllUserServices = async (req, res) => {
    try {
        const vendors = await User.find({
            role: 'vendor',
            serviceDetails: { $exists: true, $ne: [] }
        }).select('name businessName serviceDetails');

        const allServices = [];

        vendors.forEach(vendor => {
            vendor.serviceDetails.forEach(service => {
                allServices.push({
                    vendorName: vendor.name,
                    businessName: vendor.businessName,
                    ...service
                });
            });
        });

        res.status(200).json({ services: allServices });
    } catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteService = async (req, res) => {
    try {
        const userId = req.user._id;  // Get the logged-in user's ID
        const { serviceId } = req.params;  // Get the service ID from the request params

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the index of the service in the serviceDetails array
        const serviceIndex = user.serviceDetails.findIndex(service => service._id.toString() === serviceId);

        if (serviceIndex === -1) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Remove the service from the serviceDetails array
        user.serviceDetails.splice(serviceIndex, 1);

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

const updateServiceDetails = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const {
            serviceName,
            serviceType,
            description,
            paymentPolicy,
            mediaUrls = [],
        } = req.body;

        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const service = user.serviceDetails.id(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Update fields
        if (serviceName !== undefined) service.serviceName = serviceName;
        if (serviceType !== undefined) service.serviceType = serviceType;
        if (description !== undefined) service.description = description;
        if (paymentPolicy !== undefined) service.paymentPolicy = paymentPolicy;
        if (mediaUrls.length > 0) service.mediaUrls = mediaUrls;

        await user.save();

        res.status(200).json({ message: 'Service updated successfully', service });
    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific service by ID for the logged-in vendor
const getServiceById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const service = user.serviceDetails.id(req.params.serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.status(200).json(service);
    } catch (error) {
        console.error('Get service by ID error:', error);
        res.status(500).json({ message: 'Server error' });
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

// Get all packages for the logged-in vendor
const getAllPackages = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.status(200).json({ packages: user.packages });
    } catch (error) {
        console.error('Get all packages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPackageById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const packageId = req.params.packageId;
        const foundPackage = user.packages.id(packageId);

        if (!foundPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({ package: foundPackage });
    } catch (error) {
        console.error('Get package by ID error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deletePackage = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'vendor') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const packageId = req.params.packageId;
        console.log("🧾 Deleting package with ID:", packageId);

        const packageToDelete = user.packages.id(packageId);
        if (!packageToDelete) {
            console.log("⚠️ Package not found!");
            return res.status(404).json({ message: 'Package not found' });
        }

        packageToDelete.remove();
        await user.save();

        res.status(200).json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting package:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updatePackage = async (req, res) => {
    try {
        // Fetch the user data
        const user = await User.findById(req.user._id);
        if (!user) {
            console.log('User not found!');
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'vendor') {
            console.log('User is not a vendor!');
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Try to convert the package ID to ObjectId
        const objectId = ObjectId(req.params.packageId);
        console.log('Converted packageId to ObjectId:', objectId);

        // Find the package to update
        const packageToUpdate = user.packages.id(objectId);
        console.log('Found package to update:', packageToUpdate);

        if (!packageToUpdate) {
            console.log('Package not found!');
            return res.status(404).json({ message: 'Package not found' });
        }

        // Update the package fields (example: packageName, packagePrice, description)
        const { packageName, packagePrice, description } = req.body;

        if (packageName) packageToUpdate.packageName = packageName;
        if (packagePrice) packageToUpdate.packagePrice = packagePrice;
        if (description) packageToUpdate.description = description;

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Package updated successfully', package: packageToUpdate });
    } catch (error) {
        console.error('Error during package update:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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





module.exports = {deleteService,updateServiceDetails,getServiceById,getAllPackages,getPackageById,deletePackage,updatePackage, getUserProfile, updateUserProfile, updateVendorSetup, updateVendorAvailability, addServiceDetails, getAllUserServices, addPackage, addSubtask, addMainTask, getTasks, getSubtasks, deleteSubtask };
