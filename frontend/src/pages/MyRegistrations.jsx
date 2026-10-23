import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationsApi } from '../api/registrations';
import { BookmarkCheck, Calendar, Clock, MapPin, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    setLoading(true);
    try {
      const data = await registrationsApi.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your RSVP for this event?')) return;
    try {
      await registrationsApi.cancelRegistration(eventId);
      setRegistrations((prev) =>
        prev.map((r) => {
          const id = typeof r.event === 'object' ? r.event._id || r.event.id : r.event;
          return id === eventId ? { ...r, status: 'cancelled' } : r;
        })
      );
      setToastMessage('Registration cancelled.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to cancel:', err);
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to cancel registration.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Date TBA';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 hero-gradient-wash">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#123A52] flex items-center justify-center text-white shrink-0">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">My Registered Events</h1>
            <p className="text-[#123A52]/70 text-xs font-semibold">Manage your active RSVPs and upcoming symposium attendance</p>
          </div>
        </div>
        <Link
          to="/events"
          className="px-4 py-2.5 rounded-xl bg-[#123A52] hover:bg-[#2E6E8E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <span>Explore More Events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-[#123A52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A9CBDD]" />
          {toastMessage}
        </div>
      )}

      {/* Registrations List */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#123A52]/10">
          <BookmarkCheck className="w-12 h-12 text-[#5E93B0] mx-auto mb-3" />
          <h3 className="text-lg font-black text-[#123A52] uppercase mb-2">No Registrations Yet</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold max-w-md mx-auto mb-6">
            You haven't registered for any symposiums or workshops yet. Browse open events and secure your seat!
          </p>
          <Link to="/events" className="px-5 py-2.5 rounded-xl bg-[#123A52] hover:bg-[#2E6E8E] text-white text-xs font-bold uppercase tracking-wider transition-colors">
            Browse Events Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const event = reg.event;
            if (!event) return null;
            const eventId = event._id || event.id;
            const isConfirmed = reg.status === 'confirmed';
            const categoryName = typeof event.category === 'object' ? event.category?.name : event.category || 'Event';
            const departmentName = typeof event.department === 'object' ? event.department?.name : event.department || 'College Wide';
            const rawDate = event.eventDate || event.event_date;
            const eventTime = event.eventTime || event.event_time || 'Time TBA';

            return (
              <div
                key={reg._id || reg.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-[#123A52]/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A9CBDD] text-[#123A52]">
                      {categoryName}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#5E93B0] text-white">
                      {departmentName}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white ${
                        isConfirmed ? 'bg-[#2E6E8E]' : 'bg-[#B3453D]'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#123A52] uppercase hover:text-[#2E6E8E] transition-colors">
                    <Link to={`/events/${eventId}`}>{event.title}</Link>
                  </h3>

                  <div className="flex items-center gap-4 text-xs font-semibold text-[#123A52] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#2E6E8E]" />
                      {formatDate(rawDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#2E6E8E]" />
                      {eventTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#2E6E8E]" />
                      {event.venue}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/events/${eventId}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#123A52] bg-[#F5F3EE] hover:bg-[#A9CBDD]/30 border border-[#123A52]/10 transition-colors"
                  >
                    View Details
                  </Link>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(eventId)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#B3453D] hover:bg-[#B3453D]/10 border border-[#B3453D]/30 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel RSVP</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
