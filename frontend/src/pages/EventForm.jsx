import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../api/events';
import { Calendar, Clock, MapPin, Users, Tag, Building2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const EventForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    department_id: '',
    venue: '',
    event_date: '',
    event_time: '10:00 AM - 04:00 PM',
    registration_deadline: '',
    max_capacity: 50,
    status: 'published',
  });

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initFormData();
  }, [id]);

  const initFormData = async () => {
    setFetching(true);
    try {
      const [deptData, catData] = await Promise.all([
        eventsApi.getDepartments(),
        eventsApi.getCategories(),
      ]);
      setDepartments(deptData);
      setCategories(catData);

      if (catData.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: catData[0].id || catData[0]._id }));
      }
      if (deptData.length > 0 && !formData.department_id) {
        setFormData((prev) => ({ ...prev, department_id: deptData[0].id || deptData[0]._id }));
      }

      if (isEditMode) {
        const event = await eventsApi.getEventById(id);
        const formattedDate = event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '';
        const formattedDeadline = event.registration_deadline
          ? new Date(event.registration_deadline).toISOString().slice(0, 16)
          : '';

        setFormData({
          title: event.title,
          description: event.description || '',
          category_id: event.category_id?._id || event.category_id || (event.category?.id || event.category?._id),
          department_id: event.department_id?._id || event.department_id || (event.department?.id || event.department?._id),
          venue: event.venue,
          event_date: formattedDate,
          event_time: event.event_time,
          registration_deadline: formattedDeadline,
          max_capacity: event.max_capacity,
          status: event.status,
        });
      } else {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14); // 2 weeks out
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 10);

        setFormData((prev) => ({
          ...prev,
          event_date: defaultDate.toISOString().split('T')[0],
          registration_deadline: defaultDeadline.toISOString().slice(0, 16),
        }));
      }
    } catch (err) {
      console.error('Error initializing form:', err);
      setError('Failed to load initial data.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        category_id: formData.category_id,
        department_id: formData.department_id,
        max_capacity: parseInt(formData.max_capacity, 10),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
      };

      if (isEditMode) {
        await eventsApi.updateEvent(id, payload);
      } else {
        await eventsApi.createEvent(payload);
      }
      navigate('/organizer/events');
    } catch (err) {
      console.error('Save event failed:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to save event. Check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123A52] hover:text-[#2E6E8E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Events
      </Link>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 hero-gradient-wash">
        <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">
          {isEditMode ? 'Edit Symposium / Event' : 'Host New Symposium / Workshop'}
        </h1>
        <p className="text-[#123A52]/70 text-xs font-semibold mt-1">Fill out the event specifications for student registration</p>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#B3453D]/10 border border-[#B3453D]/30 text-[#B3453D] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#B3453D]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. AI & Machine Learning Symposium 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
              Event Description / Agenda
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail keynotes, agenda, requirements, prerequisites, and takeaway skills..."
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52] resize-y"
            />
          </div>

          {/* Category & Department Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
              >
                {categories.map((c) => {
                  const cId = c.id || c._id;
                  return (
                    <option key={cId} value={cId}>
                      {c.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                name="department_id"
                required
                value={formData.department_id}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
              >
                {departments.map((d) => {
                  const dId = d.id || d._id;
                  return (
                    <option key={dId} value={dId}>
                      {d.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Venue & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Venue Location *
              </label>
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium, Block A / Lab 3"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Timing / Schedule *
              </label>
              <input
                type="text"
                name="event_time"
                required
                value={formData.event_time}
                onChange={handleChange}
                placeholder="e.g. 09:30 AM - 04:30 PM"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
              />
            </div>
          </div>

          {/* Dates & Capacity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                required
                value={formData.event_date}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                RSVP Deadline *
              </label>
              <input
                type="datetime-local"
                name="registration_deadline"
                required
                value={formData.registration_deadline}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Max Seat Capacity *
              </label>
              <input
                type="number"
                name="max_capacity"
                required
                min={1}
                value={formData.max_capacity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
              Publication Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
            >
              <option value="published">Published (Open for RSVPs)</option>
              <option value="draft">Draft (Hidden from public listing)</option>
              <option value="closed">Closed (RSVPs Locked)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end gap-3">
            <Link
              to="/organizer/events"
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#123A52] hover:bg-[#F5F3EE] border border-[#123A52]/20 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-[#123A52] hover:bg-[#2E6E8E] inline-flex items-center gap-2 shadow-xs transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Event' : 'Publish Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
