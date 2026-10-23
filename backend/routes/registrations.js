import express from 'express';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import { verifyToken, requireRole } from '../auth.js';
import * as XLSX from 'xlsx';

const router = express.Router();

// @desc Register for an event
// @route POST /events/:id/register
router.post('/events/:id/register', verifyToken, requireRole(['student', 'admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ detail: `Event with ID ${eventId} not found.` });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ detail: 'Registrations are not open for this event.' });
    }

    if (new Date() > new Date(event.registration_deadline)) {
      return res.status(400).json({ detail: 'Registration deadline for this event has passed.' });
    }

    const existingReg = await Registration.findOne({ event_id: eventId, student_id: studentId });
    if (existingReg && existingReg.status === 'confirmed') {
      return res.status(400).json({ detail: 'You are already registered for this event.' });
    }

    // Atomic MongoDB seat decrement: atomically check seats_remaining > 0 and decrement
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, seats_remaining: { $gt: 0 } },
      { $inc: { seats_remaining: -1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ detail: 'Registration failed: Event is fully booked.' });
    }

    let reg;
    if (existingReg) {
      existingReg.status = 'confirmed';
      existingReg.registered_at = new Date();
      reg = await existingReg.save();
    } else {
      reg = await Registration.create({
        event_id: eventId,
        student_id: studentId,
        status: 'confirmed',
      });
    }

    return res.status(201).json({
      id: reg._id,
      event_id: reg.event_id,
      student_id: reg.student_id,
      registered_at: reg.registered_at,
      status: reg.status,
    });
  } catch (error) {
    console.error('Register for event error:', error);
    return res.status(500).json({ detail: error.message || 'Registration failed.' });
  }
});

// @desc Cancel registration
// @route DELETE /events/:id/register
router.delete('/events/:id/register', verifyToken, requireRole(['student', 'admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    const reg = await Registration.findOne({
      event_id: eventId,
      student_id: studentId,
      status: 'confirmed',
    });

    if (!reg) {
      return res.status(404).json({ detail: 'Active registration not found for this event.' });
    }

    reg.status = 'cancelled';
    await reg.save();

    // Increment seat back atomically
    await Event.findByIdAndUpdate(eventId, { $inc: { seats_remaining: 1 } });

    return res.json({ message: 'Registration successfully cancelled.' });
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to cancel registration.' });
  }
});

// @desc Get student's own registrations
// @route GET /me/registrations
router.get('/me/registrations', verifyToken, requireRole(['student', 'admin']), async (req, res) => {
  try {
    const regs = await Registration.find({ student_id: req.user._id })
      .populate({
        path: 'event_id',
        populate: [{ path: 'category_id', select: 'name' }, { path: 'department_id', select: 'name' }],
      })
      .sort({ registered_at: -1 });

    const formatted = regs.map((reg) => {
      const e = reg.event_id;
      return {
        id: reg._id,
        event_id: e ? e._id : null,
        student_id: reg.student_id,
        registered_at: reg.registered_at,
        status: reg.status,
        event: e
          ? {
              id: e._id,
              title: e.title,
              description: e.description,
              venue: e.venue,
              event_date: e.event_date,
              event_time: e.event_time,
              seats_remaining: e.seats_remaining,
              max_capacity: e.max_capacity,
              status: e.status,
              category: e.category_id ? { id: e.category_id._id, name: e.category_id.name } : null,
              department: e.department_id ? { id: e.department_id._id, name: e.department_id.name } : null,
            }
          : null,
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error('Error fetching my registrations:', error);
    return res.status(500).json({ detail: 'Failed to fetch registrations.' });
  }
});

// @desc Get attendees for an event (Organizer/Admin)
// @route GET /events/:id/attendees
router.get('/events/:id/attendees', verifyToken, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ detail: `Event with ID ${eventId} not found.` });
    }

    if (req.user.role !== 'admin' && event.organizer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ detail: 'You do not have permission to view attendees for this event.' });
    }

    const attendees = await Registration.find({ event_id: eventId, status: 'confirmed' })
      .populate('student_id', 'name email department')
      .sort({ registered_at: 1 });

    const formatted = attendees.map((reg) => ({
      id: reg._id,
      event_id: reg.event_id,
      student_id: reg.student_id ? reg.student_id._id : null,
      registered_at: reg.registered_at,
      status: reg.status,
      student: reg.student_id
        ? {
            id: reg.student_id._id,
            name: reg.student_id.name,
            email: reg.student_id.email,
            department: reg.student_id.department,
          }
        : null,
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ detail: 'Failed to fetch attendees.' });
  }
});

// @desc Export attendees CSV, XLSX, or JSON
// @route GET /events/:id/export
router.get('/events/:id/export', verifyToken, requireRole(['organizer', 'admin']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const format = req.query.format || 'csv';

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ detail: `Event with ID ${eventId} not found.` });
    }

    if (req.user.role !== 'admin' && String(event.organizer_id) !== String(req.user._id)) {
      return res.status(403).json({ detail: 'You do not have permission to export attendees.' });
    }

    const attendees = await Registration.find({ event_id: eventId, status: 'confirmed' })
      .populate('student_id', 'name email department')
      .sort({ registered_at: 1 });

    if (format === 'xlsx' || format === 'excel' || format === 'spreadsheet') {
      const rows = attendees.map((reg, idx) => {
        const s = reg.student_id || {};
        const regDate = reg.registered_at ? new Date(reg.registered_at) : null;
        return {
          'S.No': idx + 1,
          'Student Name': s.name || 'N/A',
          'Email Address': s.email || 'N/A',
          'Department': s.department || 'N/A',
          'Registration Date': regDate ? regDate.toLocaleDateString() : 'N/A',
          'Registration Time': regDate ? regDate.toLocaleTimeString() : 'N/A',
          'Status': 'Confirmed',
          'Registration ID': String(reg._id),
        };
      });

      const worksheet = rows.length > 0
        ? XLSX.utils.json_to_sheet(rows)
        : XLSX.utils.aoa_to_sheet([['S.No', 'Student Name', 'Email Address', 'Department', 'Registration Date', 'Registration Time', 'Status', 'Registration ID']]);

      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 25 },
        { wch: 32 },
        { wch: 35 },
        { wch: 18 },
        { wch: 18 },
        { wch: 12 },
        { wch: 28 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendee Roster');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const safeTitle = (event.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_attendees_roster.xlsx"`);
      return res.status(200).send(buffer);
    }

    if (format === 'json') {
      const data = attendees.map((reg) => ({
        registration_id: reg._id,
        student_id: reg.student_id ? reg.student_id._id : null,
        student_name: reg.student_id ? reg.student_id.name : 'N/A',
        student_email: reg.student_id ? reg.student_id.email : 'N/A',
        department: reg.student_id ? reg.student_id.department || 'N/A' : 'N/A',
        registered_at: reg.registered_at,
      }));
      return res.json({ event_id: eventId, event_title: event.title, attendees: data });
    }

    // Generate CSV output string with UTF-8 BOM
    let csv = '\uFEFFRegistration ID,Student ID,Student Name,Student Email,Department,Registered At\r\n';
    attendees.forEach((reg) => {
      const s = reg.student_id || {};
      const regTime = reg.registered_at ? new Date(reg.registered_at).toISOString() : '';
      csv += `"${reg._id}","${s._id || ''}","${(s.name || '').replace(/"/g, '""')}","${(s.email || '').replace(/"/g, '""')}","${(s.department || 'N/A').replace(/"/g, '""')}","${regTime}"\r\n`;
    });

    const safeTitle = (event.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}_attendees.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ detail: 'Failed to export attendees.' });
  }
});

export default router;
