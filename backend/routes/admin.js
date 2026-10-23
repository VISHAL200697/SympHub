import express from 'express';
import User from '../models/User.js';
import { Department, Category } from '../models/Lookup.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { verifyToken, requireRole } from '../auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole(['admin']));

// @desc Get all users with role/search filters
// @route GET /admin/users
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      is_active: u.is_active,
      created_at: u.createdAt,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch users.' });
  }
});

// @desc Update user role or status
// @route PATCH /admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const { role, is_active } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ detail: `User with ID ${req.params.id} not found.` });
    }

    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;

    await user.save();

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      is_active: user.is_active,
      created_at: user.createdAt,
    });
  } catch (error) {
    return res.status(400).json({ detail: 'Failed to update user.' });
  }
});

// @desc Admin Overview Metrics
// @route GET /admin/overview
router.get('/overview', async (req, res) => {
  try {
    const [total_events, total_registrations, total_users, total_students, total_organizers] =
      await Promise.all([
        Event.countDocuments(),
        Registration.countDocuments({ status: 'confirmed' }),
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'organizer' }),
      ]);

    return res.json({
      total_events,
      total_registrations,
      total_users,
      total_students,
      total_organizers,
    });
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch overview metrics.' });
  }
});

// @desc Get departments
// @route GET /admin/departments
router.get('/departments', async (req, res) => {
  try {
    const depts = await Department.find().sort({ name: 1 });
    return res.json(depts);
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch departments.' });
  }
});

// @desc Create department
// @route POST /admin/departments
router.post('/departments', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ detail: 'Department name is required.' });
    }

    const existing = await Department.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ detail: 'Department name already exists.' });
    }

    const dept = await Department.create({ name: name.trim() });
    return res.status(201).json({ id: dept._id, name: dept.name });
  } catch (error) {
    return res.status(400).json({ detail: error.message || 'Failed to create department.' });
  }
});

// @desc Delete department
// @route DELETE /admin/departments/:id
router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findById(id);
    if (!dept) {
      return res.status(404).json({ detail: 'Department not found.' });
    }

    const eventCount = await Event.countDocuments({ department_id: id });
    if (eventCount > 0) {
      return res.status(400).json({
        detail: `Cannot delete department "${dept.name}". There are ${eventCount} event(s) associated with it.`,
      });
    }

    await Department.findByIdAndDelete(id);
    return res.json({ message: `Department "${dept.name}" removed successfully.`, id });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({ detail: error.message || 'Failed to delete department.' });
  }
});

// @desc Get categories
// @route GET /admin/categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    return res.json(cats);
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch categories.' });
  }
});

// @desc Create category
// @route POST /admin/categories
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ detail: 'Category name is required.' });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ detail: 'Category name already exists.' });
    }

    const cat = await Category.create({ name: name.trim() });
    return res.status(201).json({ id: cat._id, name: cat.name });
  } catch (error) {
    return res.status(400).json({ detail: error.message || 'Failed to create category.' });
  }
});

// @desc Delete category
// @route DELETE /admin/categories/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({ detail: 'Category not found.' });
    }

    const eventCount = await Event.countDocuments({ category_id: id });
    if (eventCount > 0) {
      return res.status(400).json({
        detail: `Cannot delete category "${cat.name}". There are ${eventCount} event(s) associated with it.`,
      });
    }

    await Category.findByIdAndDelete(id);
    return res.json({ message: `Category "${cat.name}" removed successfully.`, id });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ detail: error.message || 'Failed to delete category.' });
  }
});

export default router;
