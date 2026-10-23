import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi } from '../api/events';
import { registrationsApi } from '../api/registrations';
import { Users, FileSpreadsheet, ArrowLeft, Mail, Building, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

export const Attendees = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAttendeesData();
  }, [id]);

  const fetchAttendeesData = async () => {
    setLoading(true);
    try {
      const [eventData, attendeesData] = await Promise.all([
        eventsApi.getEventById(id),
        registrationsApi.getEventAttendees(id),
      ]);
      setEvent(eventData);
      setAttendees(attendeesData);
    } catch (err) {
      console.error('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = (blob, filename) => {
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
  };

  const handleExportSpreadsheet = async () => {
    setExporting(true);
    try {
      let downloaded = false;

      // 1. Try backend xlsx endpoint first
      try {
        const blobData = await registrationsApi.exportEventAttendees(id, 'xlsx');
        if (blobData && (blobData instanceof Blob || blobData.byteLength || blobData.size > 0)) {
          const safeTitle = (event?.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
          const filename = `${safeTitle}_attendees_roster.xlsx`;
          const blob =
            blobData instanceof Blob
              ? blobData
              : new Blob([blobData], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
          triggerDownload(blob, filename);
          downloaded = true;
        }
      } catch (apiErr) {
        console.warn('Backend spreadsheet export returned error, generating in-browser:', apiErr);
      }

      // 2. Generate native Excel spreadsheet with SheetJS in browser
      if (!downloaded) {
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

        const safeTitle = (event?.title || 'event').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
        const filename = `${safeTitle}_attendees_roster.xlsx`;
        XLSX.writeFile(workbook, filename);
      }
    } catch (err) {
      console.error('Spreadsheet export failed:', err);
      alert('Failed to download spreadsheet: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123A52] hover:text-[#2E6E8E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Events
      </Link>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 hero-gradient-wash">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#A9CBDD] text-[#123A52] text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Attendee Registration Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">{event?.title}</h1>
          <p className="text-[#123A52]/70 text-xs font-semibold">
            Total Confirmed Registrations:{' '}
            <span className="text-[#2E6E8E] font-black">{attendees.length}</span> / {event?.max_capacity} Seats
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportSpreadsheet}
            disabled={exporting}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Download attendee roster as Microsoft Excel (.xlsx) spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'Generating Spreadsheet...' : 'Download Spreadsheet (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Table Roster */}
      {attendees.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#123A52]/10">
          <Users className="w-12 h-12 text-[#5E93B0] mx-auto mb-3" />
          <h3 className="text-xl font-black text-[#123A52] uppercase mb-1">No Registered Attendees Yet</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold">Students who register for this event will appear in this live roster.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#123A52]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-[#123A52]">
              <thead className="bg-[#F5F3EE] uppercase text-[11px] font-black text-[#123A52] border-b border-[#123A52]/10">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">RSVP Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#123A52]/10">
                {attendees.map((reg, idx) => (
                  <tr key={reg.id || reg._id} className="hover:bg-[#F5F3EE]/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-[#123A52]/60">{idx + 1}</td>
                    <td className="px-6 py-4 font-black text-[#123A52] uppercase">{reg.student?.name}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#2E6E8E] shrink-0" />
                        {reg.student?.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#5E93B0] shrink-0" />
                        {reg.student?.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#123A52]/70">
                      {new Date(reg.registered_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export const EventRegistrations = Attendees;
export default Attendees;
