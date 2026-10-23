import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../api/events';
import { registrationsApi } from '../api/registrations';
import { useAuth } from '../AuthContext';
import { Calendar, Clock, MapPin, Users, User, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const { isAuthenticated, user, isStudent } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getEventById(id);
      setEvent(data);

      if (isAuthenticated && isStudent) {
        const regs = await registrationsApi.getMyRegistrations();
        const found = regs.some((r) => {
          const regEvtId = typeof r.event === 'object' ? r.event._id || r.event.id : r.event;
          return regEvtId === id && r.status === 'confirmed';
        });
        setIsRegistered(found);
      }
    } catch (err) {
      console.error('Error fetching event detail:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Event not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await registrationsApi.registerForEvent(id);
      setIsRegistered(true);
      setEvent((prev) => {
        const seats = prev.seatsRemaining ?? prev.seats_remaining ?? 0;
        return { ...prev, seatsRemaining: Math.max(0, seats - 1), seats_remaining: Math.max(0, seats - 1) };
      });
      setToastMessage('🎉 Successfully registered!');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to register.');
    }
  };

  const handleCancel = async () => {
    try {
      await registrationsApi.cancelRegistration(id);
      setIsRegistered(false);
      setEvent((prev) => {
        const seats = prev.seatsRemaining ?? prev.seats_remaining ?? 0;
        return { ...prev, seatsRemaining: seats + 1, seats_remaining: seats + 1 };
      });
      setToastMessage('Registration cancelled.');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to cancel registration.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-12 rounded-2xl border border-[#123A52]/10">
          <AlertCircle className="w-12 h-12 text-[#B3453D] mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-[#123A52] uppercase mb-2">{error || 'Event Not Found'}</h2>
          <Link to="/events" className="text-[#2E6E8E] hover:underline text-xs font-bold uppercase tracking-wider">
            &larr; Back to Events Listing
          </Link>
        </div>
      </div>
    );
  }

  const rawDate = event.eventDate || event.event_date;
  const rawDeadline = event.registrationDeadline || event.registration_deadline;
  const eventTime = event.eventTime || event.event_time || 'Time TBA';
  const seatsRemaining = event.seatsRemaining ?? event.seats_remaining ?? 0;
  const maxCapacity = event.maxCapacity ?? event.max_capacity ?? 0;
  const categoryName = typeof event.category === 'object' ? event.category?.name : event.category || 'General';
  const departmentName = typeof event.department === 'object' ? event.department?.name : event.department || 'College Wide';

  const isClosed = seatsRemaining === 0 || event.status === 'closed';
  const isDeadlinePassed = rawDeadline ? new Date(rawDeadline) < new Date() : false;
  const isDisabled = isClosed || isDeadlinePassed;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Date TBA';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Link */}
      <Link to="/events" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123A52] hover:text-[#2E6E8E] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to All Events
      </Link>

      {/* Main Surface Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 space-y-8 border border-[#123A52]/10 hero-gradient-wash">
        {toastMessage && (
          <div className="p-4 rounded-xl bg-[#123A52] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#A9CBDD]" />
            {toastMessage}
          </div>
        )}

        {/* Flat Solid Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A9CBDD] text-[#123A52]">
            {categoryName}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#5E93B0] text-white">
            {departmentName}
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white ${
            event.status === 'published' ? 'bg-[#2E6E8E]' : 'bg-[#B3453D]'
          }`}>
            {event.status}
          </span>
        </div>

        {/* Heavy Uppercase Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-[#123A52] uppercase tracking-tight leading-tight">
          {event.title}
        </h1>

        {/* Key Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#123A52]/10">
            <Calendar className="w-5 h-5 text-[#2E6E8E] mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-[#123A52]/70 font-bold block">Date</span>
            <span className="text-xs font-black text-[#123A52]">{formatDate(rawDate)}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#123A52]/10">
            <Clock className="w-5 h-5 text-[#2E6E8E] mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-[#123A52]/70 font-bold block">Time</span>
            <span className="text-xs font-black text-[#123A52]">{eventTime}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#123A52]/10">
            <MapPin className="w-5 h-5 text-[#2E6E8E] mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-[#123A52]/70 font-bold block">Venue</span>
            <span className="text-xs font-black text-[#123A52] truncate block">{event.venue}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F3EE] border border-[#123A52]/10">
            <Users className="w-5 h-5 text-[#2E6E8E] mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-[#123A52]/70 font-bold block">Seats Available</span>
            <span className={`text-xs font-black ${seatsRemaining > 0 ? 'text-[#2E6E8E]' : 'text-[#B3453D]'}`}>
              {seatsRemaining} / {maxCapacity} left
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="space-y-3 border-t border-[#123A52]/10 pt-6">
          <h2 className="text-base font-black text-[#123A52] uppercase">About This Event</h2>
          <p className="text-[#123A52]/80 leading-relaxed text-xs sm:text-sm font-medium whitespace-pre-line">
            {event.description || 'No detailed description available for this event.'}
          </p>
        </div>

        {/* Organizer Info */}
        <div className="p-4 rounded-2xl bg-[#F5F3EE] border border-[#123A52]/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#123A52] text-white flex items-center justify-center font-extrabold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-[#123A52]/60 font-bold uppercase block">Organized By</span>
            <span className="text-xs font-black text-[#123A52]">{event.organizer?.name || 'Faculty Organizer'}</span>
            <span className="text-xs text-[#5E93B0] font-semibold block">{event.organizer?.email}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-t border-[#123A52]/10 pt-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-[#123A52]/80 font-bold">
            <span className="uppercase tracking-wider block">Registration Deadline:</span>
            <span className="text-[#123A52]">{formatDeadline(rawDeadline)}</span>
          </div>

          {isRegistered ? (
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 rounded-xl bg-[#5E93B0]/20 text-[#123A52] text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E6E8E]" /> RSVP Confirmed
              </span>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#B3453D] border border-[#B3453D]/30 hover:bg-[#B3453D]/10 transition-colors"
              >
                Cancel RSVP
              </button>
            </div>
          ) : (
            isStudent && (
              <button
                onClick={handleRegister}
                disabled={isDisabled}
                className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all ${
                  isDisabled
                    ? 'bg-[#A9CBDD]/40 text-[#123A52]/40 cursor-not-allowed'
                    : 'bg-[#123A52] hover:bg-[#2E6E8E]'
                }`}
              >
                {isDisabled ? (isDeadlinePassed ? 'Registration Closed' : 'Event Fully Booked') : 'Confirm RSVP'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
