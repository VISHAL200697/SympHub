import express from 'express';
import Event from '../models/Event.js';
import { Department, Category } from '../models/Lookup.js';
import { verifyToken, requireRole } from '../auth.js';

const router = express.Router();

// @desc Get public departments list
// @route GET /departments
router.get('/departments', async (req, res) => {
  try {
    const depts = await Department.find().sort({ name: 1 });
    return res.json(depts);
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch departments.' });
  }
});

// @desc Get public categories list
// @route GET /categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    return res.json(cats);
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch categories.' });
  }
});

// @desc Get all events with filters
// @route GET /events
router.get('/events', async (req, res) => {
  try {
    const { category_id, department_id, search, upcoming_only, status_filter } = req.query;

    const filter = {};

    if (category_id) filter.category_id = category_id;
    if (department_id) filter.department_id = department_id;
    if (status_filter) {
      filter.status = status_filter;
    } else {
      filter.status = { $ne: 'draft' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    if (upcoming_only === 'true' || upcoming_only === true) {
      filter.registration_deadline = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate('category_id', 'name')
      .populate('department_id', 'name')
      .populate('organizer_id', 'name email department role')
      .sort({ event_date: 1, event_time: 1 });

    const formattedEvents = events.map((event) => {
      const obj = event.toJSON();
      return {
        ...obj,
        category: event.category_id ? { id: event.category_id._id, name: event.category_id.name } : null,
        department: event.department_id ? { id: event.department_id._id, name: event.department_id.name } : null,
        organizer: event.organizer_id
          ? {
              id: event.organizer_id._id,
              name: event.organizer_id.name,
              email: event.organizer_id.email,
              role: event.organizer_id.role,
              department: event.organizer_id.department,
            }
          : null,
      };
    });

    return res.json(formattedEvents);
  } catch (error) {
    console.error('Error in getEvents:', error);
    return res.status(500).json({ detail: 'Failed to fetch events.' });
  }
});

// @desc Get event by ID
// @route GET /events/:id
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('category_id', 'name')
      .populate('department_id', 'name')
      .populate('organizer_id', 'name email department role');

    if (!event) {
      return res.status(404).json({ detail: `Event with ID ${req.params.id} not found.` });
    }

    const obj = event.toJSON();
    const formatted = {
      ...obj,
      category: event.category_id ? { id: event.category_id._id, name: event.category_id.name } : null,
      department: event.department_id ? { id: event.department_id._id, name: event.department_id.name } : null,
      organizer: event.organizer_id
        ? {
            id: event.organizer_id._id,
            name: event.organizer_id.name,
            email: event.organizer_id.email,
            role: event.organizer_id.role,
            department: event.organizer_id.department,
          }
        : null,
    };

    return res.json(formatted);
  } catch (error) {
    return res.status(404).json({ detail: 'Event not found or invalid ID format.' });
  }
});

// @desc Create new event
// @route POST /events
router.post('/events', verifyToken, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      department_id,
      venue,
      event_date,
      event_time,
      registration_deadline,
      max_capacity,
      status,
    } = req.body;

    const newEvent = await Event.create({
      title,
      description,
      category_id,
      department_id,
      organizer_id: req.user._id,
      venue,
      event_date,
      event_time,
      registration_deadline,
      max_capacity,
      seats_remaining: max_capacity,
      status: status || 'published',
    });

    const populated = await Event.findById(newEvent._id)
      .populate('category_id', 'name')
      .populate('department_id', 'name')
      .populate('organizer_id', 'name email department role');

    const obj = populated.toJSON();
    return res.status(201).json({
      ...obj,
      category: populated.category_id ? { id: populated.category_id._id, name: populated.category_id.name } : null,
      department: populated.department_id ? { id: populated.department_id._id, name: populated.department_id.name } : null,
      organizer: populated.organizer_id
        ? {
            id: populated.organizer_id._id,
            name: populated.organizer_id.name,
            email: populated.organizer_id.email,
            role: populated.organizer_id.role,
          }
        : null,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(400).json({ detail: error.message || 'Failed to create event.' });
  }
});

// @desc Update event
// @route PUT /events/:id
router.put('/events/:id', verifyToken, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ detail: `Event with ID ${req.params.id} not found.` });
    }

    if (req.user.role !== 'admin' && event.organizer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ detail: 'You do not have permission to edit this event.' });
    }

    const { max_capacity } = req.body;
    if (max_capacity !== undefined && max_capacity !== event.max_capacity) {
      const diff = max_capacity - event.max_capacity;
      const newSeats = event.seats_remaining + diff;
      if (newSeats < 0) {
        return res
          .status(400)
          .json({ detail: 'New capacity cannot be lower than current registered attendees count.' });
      }
      event.seats_remaining = newSeats;
      event.max_capacity = max_capacity;
    }

    Object.assign(event, req.body);
    await event.save();

    const updated = await Event.findById(event._id)
      .populate('category_id', 'name')
      .populate('department_id', 'name')
      .populate('organizer_id', 'name email department role');

    const obj = updated.toJSON();
    return res.json({
      ...obj,
      category: updated.category_id ? { id: updated.category_id._id, name: updated.category_id.name } : null,
      department: updated.department_id ? { id: updated.department_id._id, name: updated.department_id.name } : null,
      organizer: updated.organizer_id
        ? {
            id: updated.organizer_id._id,
            name: updated.organizer_id.name,
            email: updated.organizer_id.email,
          }
        : null,
    });
  } catch (error) {
    return res.status(400).json({ detail: error.message || 'Failed to update event.' });
  }
});

// @desc Delete event
// @route DELETE /events/:id
router.delete('/events/:id', verifyToken, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ detail: `Event with ID ${req.params.id} not found.` });
    }

    if (req.user.role !== 'admin' && event.organizer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ detail: 'You do not have permission to delete this event.' });
    }

    await event.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to delete event.' });
  }
});

export default router;
