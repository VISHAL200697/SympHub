import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';

export const EventCard = ({ event, isRegistered, onRegister, onCancel, userRole }) => {
  // Safe field extraction supporting both camelCase (Express/Mongoose) and snake_case
  const eventId = event._id || event.id;
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

  // Format date cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Date TBA';
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formattedDate = formatDate(rawDate);
  const fillPercentage = maxCapacity > 0 ? Math.min(100, Math.round(((maxCapacity - seatsRemaining) / maxCapacity) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#123A52]/10 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-[#5E93B0] hover:-translate-y-0.5">
      <div className="p-6 flex-1">
        {/* Flat Solid Badges (no outlines, no icons, rounded-lg) */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A9CBDD] text-[#123A52]">
            {categoryName}
          </span>
          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#5E93B0] text-white">
            {departmentName}
          </span>
        </div>

        {/* Heavy Uppercase Headline */}
        <h3 className="text-lg font-black text-[#123A52] uppercase mb-2 line-clamp-2 leading-tight">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-[#123A52]/80 text-xs font-medium mb-5 line-clamp-2 leading-relaxed">
          {event.description || 'No description provided.'}
        </p>

        {/* Date, Time, Venue */}
        <div className="space-y-2 text-xs font-semibold text-[#123A52] mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2E6E8E] shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2E6E8E] shrink-0" />
            <span>{eventTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2E6E8E] shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Flat Progress Bar for Seat Availability */}
        <div className="pt-4 border-t border-[#123A52]/10 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#123A52]">
            <span className="flex items-center gap-1.5 uppercase">
              <Users className="w-3.5 h-3.5 text-[#2E6E8E]" />
              Seats Availability
            </span>
            <span className={seatsRemaining === 0 ? 'text-[#B3453D]' : 'text-[#2E6E8E]'}>
              {seatsRemaining} / {maxCapacity} left
            </span>
          </div>
          <div className="w-full bg-[#A9CBDD]/30 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                seatsRemaining === 0 ? 'bg-[#B3453D]' : 'bg-[#2E6E8E]'
              }`}
              style={{ width: `${100 - fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-6 py-4 bg-[#F5F3EE]/60 border-t border-[#123A52]/10 flex items-center justify-between gap-3">
        <Link
          to={`/events/${eventId}`}
          className="text-xs font-extrabold text-[#123A52] hover:text-[#2E6E8E] uppercase tracking-wider transition-colors"
        >
          View Details &rarr;
        </Link>

        {isRegistered ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2E6E8E] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-[#2E6E8E]" /> RSVP Confirmed
            </span>
            {onCancel && (
              <button
                onClick={() => onCancel(eventId)}
                className="text-xs text-[#B3453D] hover:underline font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          userRole === 'student' && (
            <button
              onClick={() => onRegister(eventId)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                isDisabled
                  ? 'bg-[#A9CBDD]/40 text-[#123A52]/40 cursor-not-allowed'
                  : 'bg-[#123A52] text-white hover:bg-[#2E6E8E]'
              }`}
            >
              {isDisabled ? (isDeadlinePassed ? 'Closed' : 'Full') : 'RSVP Now'}
            </button>
          )
        )}
      </div>
    </div>
  );
};
