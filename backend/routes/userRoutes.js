/**
 * routes/userRoutes.js — Staff/user management (admin only)
 */
const express = require('express');
const router  = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',                 authorize('admin'), getAllUsers);
router.post('/',                authorize('admin'), createUser);
router.get('/:id',              authorize('admin'), getUserById);
router.put('/:id',              authorize('admin'), updateUser);
router.put('/:id/toggle-status',authorize('admin'), toggleUserStatus);

module.exports = router;

