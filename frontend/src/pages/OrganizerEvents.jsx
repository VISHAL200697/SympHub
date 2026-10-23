import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../api/events';
import { registrationsApi } from '../api/registrations';
import { useAuth } from '../AuthContext';
import { PlusCircle, Calendar, Users, Edit3, Trash2, LayoutDashboard, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export const OrganizerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const allEvents = await eventsApi.getEvents({ status_filter: '' });
      const filtered = isAdmin
        ? allEvents
        : allEvents.filter((e) => {
            const orgId = typeof e.organizer === 'object' ? e.organizer?.id || e.organizer?._id : e.organizer_id;
            return orgId === user.id || orgId === user._id;
          });
      setEvents(filtered);
    } catch (err) {
      console.error('Error fetching my events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      await eventsApi.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => (e._id || e.id) !== eventId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.detail || err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleExportSpreadsheet = async (eventId, title) => {
    try {
      let downloaded = false;
      try {
        const blobData = await registrationsApi.exportEventAttendees(eventId, 'xlsx');
        if (blobData && (blobData instanceof Blob || blobData.byteLength || blobData.size > 0)) {
          const safeTitle = (title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
          const filename = `${safeTitle}_attendees_roster.xlsx`;
          const blob =
            blobData instanceof Blob
              ? blobData
              : new Blob([blobData], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          }, 200);
          downloaded = true;
        }
      } catch (err) {
        console.warn('API spreadsheet export returned error, generating in-browser:', err);
      }

      if (!downloaded) {
        const attendees = await registrationsApi.getEventAttendees(eventId);
        const rows = attendees.map((reg, idx) => {
          const s = reg.student || {};
          const regDate = reg.registered_at ? new Date(reg.registered_at) : null;
          return {
            'S.No': idx + 1,
            'Student Name': s.name || 'N/A',
            'Email Address': s.email || 'N/A',
            'Department': s.department || 'N/A',
            'Registration Date': regDate ? regDate.toLocaleDateString() : 'N/A',
            'Registration Time': regDate ? regDate.toLocaleTimeString() : 'N/A',
            'Status': 'Confirmed',
            'Registration ID': reg.id || reg._id || 'N/A',
          };
        });

        const worksheet =
          rows.length > 0
            ? XLSX.utils.json_to_sheet(rows)
            : XLSX.utils.aoa_to_sheet([
                [
                  'S.No',
                  'Student Name',
                  'Email Address',
                  'Department',
                  'Registration Date',
                  'Registration Time',
                  'Status',
                  'Registration ID',
                ],
              ]);

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

        const safeTitle = (title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
        const filename = `${safeTitle}_attendees_roster.xlsx`;
        XLSX.writeFile(workbook, filename);
      }
    } catch (err) {
      console.error('Spreadsheet export failed:', err);
      alert('Failed to download spreadsheet: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#123A52] text-white flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">
              Organizer Dashboard
            </h1>
            <p className="text-[#123A52]/70 text-xs font-semibold">
              Create and manage your symposiums, workshops, and attendee rosters
            </p>
          </div>
        </div>

        <Link
          to="/organizer/events/new"
          className="px-5 py-2.5 rounded-xl bg-[#123A52] hover:bg-[#2E6E8E] text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish New Event</span>
        </Link>
      </div>

      {/* Events Table / List */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#123A52]/10">
          <Calendar className="w-12 h-12 text-[#5E93B0] mx-auto mb-3" />
          <h3 className="text-xl font-black text-[#123A52] uppercase mb-2">No Events Published Yet</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold max-w-md mx-auto mb-6">
            Get started by publishing your first technical symposium, hackathon, or department workshop.
          </p>
          <Link
            to="/organizer/events/new"
            className="px-5 py-2.5 rounded-xl bg-[#123A52] text-white text-xs font-extrabold uppercase"
          >
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#123A52]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-[#123A52]">
              <thead className="bg-[#F5F3EE] uppercase text-[11px] font-black text-[#123A52] border-b border-[#123A52]/10">
                <tr>
                  <th className="px-6 py-4">Event Title</th>
                  <th className="px-6 py-4">Category & Dept</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Capacity & Seats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#123A52]/10">
                {events.map((event) => {
                  const id = event._id || event.id;
                  const catName =
                    typeof event.category === 'object' ? event.category?.name : event.category || 'General';
                  const deptName =
                    typeof event.department === 'object'
                      ? event.department?.name
                      : event.department || 'College Wide';
                  const seatsRemaining = event.seatsRemaining ?? event.seats_remaining ?? 0;
                  const maxCapacity = event.maxCapacity ?? event.max_capacity ?? 0;

                  return (
                    <tr key={id} className="hover:bg-[#F5F3EE]/50 transition-colors">
                      <td className="px-6 py-4 font-black text-[#123A52] uppercase max-w-xs">
                        <Link to={`/events/${id}`} className="hover:text-[#2E6E8E] transition-colors line-clamp-1">
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#123A52]">{catName}</div>
                        <div className="text-[#123A52]/60 text-[11px]">{deptName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#123A52]">
                          {new Date(event.event_date || event.eventDate).toLocaleDateString()}
                        </div>
                        <div className="text-[#123A52]/60 text-[11px]">{event.event_time || event.eventTime}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#2E6E8E]">
                        {maxCapacity - seatsRemaining} / {maxCapacity} Registered
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            event.status === 'published'
                              ? 'bg-[#A9CBDD] text-[#123A52]'
                              : 'bg-[#5E93B0] text-white'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/organizer/events/${id}/registrations`}
                          className="px-2.5 py-1.5 rounded-lg bg-[#123A52] text-white hover:bg-[#2E6E8E] text-xs font-extrabold uppercase inline-flex items-center gap-1"
                          title="View Attendees Roster"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Attendees</span>
                        </Link>

                        <button
                          onClick={() => handleExportSpreadsheet(id, event.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Download Attendee Spreadsheet (.xlsx)"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Spreadsheet</span>
                        </button>

                        <Link
                          to={`/organizer/events/${id}/edit`}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F5F3EE] text-[#123A52] hover:bg-[#A9CBDD] border border-[#123A52]/20 text-xs font-bold inline-flex items-center gap-1"
                          title="Edit Event"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(id, event.title)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#B3453D]/10 text-[#B3453D] hover:bg-[#B3453D]/20 border border-[#B3453D]/20 text-xs font-bold inline-flex items-center gap-1"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export const MyEvents = OrganizerEvents;
export default OrganizerEvents;
