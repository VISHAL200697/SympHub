import React, { useState, useEffect } from 'react';
import { eventsApi } from '../api/events';
import { registrationsApi } from '../api/registrations';
import { useAuth } from '../AuthContext';
import { EventCard } from '../components/EventCard';
import { Search, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { isAuthenticated, user, isStudent } = useAuth();

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [search, selectedCategory, selectedDept, upcomingOnly]);

  useEffect(() => {
    if (isAuthenticated && isStudent) {
      fetchUserRegistrations();
    }
  }, [isAuthenticated, isStudent]);

  const fetchMetadata = async () => {
    try {
      const [deptData, catData] = await Promise.all([
        eventsApi.getDepartments(),
        eventsApi.getCategories(),
      ]);
      setDepartments(deptData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedDept) params.department_id = selectedDept;
      if (upcomingOnly) params.upcoming_only = 'true';

      const data = await eventsApi.getEvents(params);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const regs = await registrationsApi.getMyRegistrations();
      const activeIds = new Set(
        regs.map((r) => (typeof r.event === 'object' ? r.event._id || r.event.id : r.event))
      );
      setRegisteredEventIds(activeIds);
    } catch (err) {
      console.error('Error fetching user registrations:', err);
    }
  };

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      showToast('Please sign in to register for events.');
      return;
    }
    try {
      await registrationsApi.registerForEvent(eventId);
      setRegisteredEventIds((prev) => new Set(prev).add(eventId));
      setEvents((prev) =>
        prev.map((e) => {
          const id = e._id || e.id;
          if (id === eventId) {
            const seats = e.seatsRemaining ?? e.seats_remaining ?? 0;
            return { ...e, seatsRemaining: Math.max(0, seats - 1), seats_remaining: Math.max(0, seats - 1) };
          }
          return e;
        })
      );
      showToast('🎉 Successfully registered for event!');
    } catch (err) {
      console.error('Registration failed:', err);
      showToast(err.response?.data?.detail || err.response?.data?.message || 'Failed to register.');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await registrationsApi.cancelRegistration(eventId);
      setRegisteredEventIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      setEvents((prev) =>
        prev.map((e) => {
          const id = e._id || e.id;
          if (id === eventId) {
            const seats = e.seatsRemaining ?? e.seats_remaining ?? 0;
            return { ...e, seatsRemaining: seats + 1, seats_remaining: seats + 1 };
          }
          return e;
        })
      );
      showToast('Registration cancelled.');
    } catch (err) {
      console.error('Cancel failed:', err);
      showToast(err.response?.data?.detail || err.response?.data?.message || 'Failed to cancel registration.');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 px-5 py-3 rounded-xl bg-[#123A52] text-white shadow-xl flex items-center gap-3 animate-bounce border border-[#5E93B0]">
          <Sparkles className="w-4 h-4 text-[#A9CBDD]" />
          <span className="font-bold text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-white border border-[#123A52]/10 p-8 sm:p-12 hero-gradient-wash">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#A9CBDD] text-[#123A52] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Centralized College Event Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#123A52] uppercase tracking-tight mb-4 leading-tight">
            Discover Symposiums & Workshops
          </h1>

          <p className="text-[#123A52]/80 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl">
            Single-click RSVP for technical symposiums, hands-on hackathons, cultural fests, and guest seminars hosted by college departments.
          </p>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#123A52]/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, description, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => {
                const id = c._id || c.id;
                return (
                  <option key={id} value={id}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
            >
              <option value="">All Departments</option>
              {departments.map((d) => {
                const id = d._id || d.id;
                return (
                  <option key={id} value={id}>
                    {d.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Checkbox Filter */}
        <div className="flex items-center justify-between pt-2 text-xs font-bold text-[#123A52]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => setUpcomingOnly(e.target.checked)}
              className="w-4 h-4 rounded border-[#123A52]/30 text-[#123A52] focus:ring-[#123A52]"
            />
            <span className="uppercase tracking-wider">Show Upcoming Events Only</span>
          </label>

          {(search || selectedCategory || selectedDept || upcomingOnly) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedDept('');
                setUpcomingOnly(false);
              }}
              className="text-xs text-[#2E6E8E] hover:underline flex items-center gap-1 uppercase font-extrabold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#123A52]/10">
          <AlertCircle className="w-10 h-10 text-[#5E93B0] mx-auto mb-3" />
          <h3 className="text-lg font-black text-[#123A52] uppercase mb-1">No Events Found</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold max-w-md mx-auto">
            No active events match your search criteria. Try clearing filters or searching for different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const id = event._id || event.id;
            return (
              <EventCard
                key={id}
                event={event}
                isRegistered={registeredEventIds.has(id)}
                onRegister={handleRegister}
                onCancel={handleCancel}
                userRole={user?.role}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const EventListing = Events;
export default Events;
