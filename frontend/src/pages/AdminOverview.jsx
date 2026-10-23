import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { Shield, Users, Calendar, BookmarkCheck, UserCheck, Settings, ArrowRight } from 'lucide-react';

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAdminOverview();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 hero-gradient-wash flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#123A52] text-white flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">Admin Control Panel</h1>
            <p className="text-[#123A52]/70 text-xs font-semibold">System metrics overview & master platform controls</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-[#F5F3EE] hover:bg-[#A9CBDD]/40 text-[#123A52] border border-[#123A52]/10 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            User Management
          </Link>
          <Link
            to="/admin/lookups"
            className="px-4 py-2 rounded-xl bg-[#F5F3EE] hover:bg-[#A9CBDD]/40 text-[#123A52] border border-[#123A52]/10 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Departments & Categories
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#123A52]/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#123A52]/70">Total Events</span>
            <div className="w-10 h-10 rounded-xl bg-[#A9CBDD] text-[#123A52] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-[#123A52]">{stats?.total_events || 0}</div>
          <p className="text-xs text-[#123A52]/60 font-semibold mt-2">Active symposiums & workshops</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#123A52]/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#123A52]/70">Total RSVPs</span>
            <div className="w-10 h-10 rounded-xl bg-[#5E93B0] text-white flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-[#123A52]">{stats?.total_registrations || 0}</div>
          <p className="text-xs text-[#123A52]/60 font-semibold mt-2">Confirmed student RSVPs</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#123A52]/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#123A52]/70">Registered Students</span>
            <div className="w-10 h-10 rounded-xl bg-[#123A52] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-[#123A52]">{stats?.total_students || 0}</div>
          <p className="text-xs text-[#123A52]/60 font-semibold mt-2">Active student accounts</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#123A52]/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#123A52]/70">Faculty Organizers</span>
            <div className="w-10 h-10 rounded-xl bg-[#2E6E8E] text-white flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-[#123A52]">{stats?.total_organizers || 0}</div>
          <p className="text-xs text-[#123A52]/60 font-semibold mt-2">Verified event hosts</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-2xl border border-[#123A52]/10 hover:border-[#123A52] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#A9CBDD] text-[#123A52] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-[#123A52]/50 group-hover:text-[#123A52] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-black text-[#123A52] uppercase mb-1">User Management Table</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold">
            Review registered platform users, adjust roles (Student, Organizer, Admin), and activate or deactivate accounts.
          </p>
        </Link>

        <Link
          to="/admin/lookups"
          className="bg-white p-6 rounded-2xl border border-[#123A52]/10 hover:border-[#123A52] transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#5E93B0] text-white flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <ArrowRight className="w-5 h-5 text-[#123A52]/50 group-hover:text-[#123A52] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-black text-[#123A52] uppercase mb-1">Departments & Categories CRUD</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold">
            Add and manage institutional academic departments and event category classifications.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminOverview;
