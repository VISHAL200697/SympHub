import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Users, Search, Shield, UserCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await adminApi.getUsers(params);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const updated = await adminApi.updateUser(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => ((u.id || u._id) === userId ? updated : u)));
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      const updated = await adminApi.updateUser(userId, { is_active: !currentStatus });
      setUsers((prev) => prev.map((u) => ((u.id || u._id) === userId ? updated : u)));
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 hero-gradient-wash flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#123A52] text-white flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">User Account Management</h1>
            <p className="text-[#123A52]/70 text-xs font-semibold">Control account activations, search members, and assign platform roles</p>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#123A52]/10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user by name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#123A52] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#123A52]/10">
          <AlertCircle className="w-12 h-12 text-[#5E93B0] mx-auto mb-3" />
          <h3 className="text-xl font-black text-[#123A52] uppercase mb-1">No Users Found</h3>
          <p className="text-[#123A52]/70 text-xs font-semibold">No user accounts match your search filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-[#123A52]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-[#123A52]">
              <thead className="bg-[#F5F3EE] uppercase text-[11px] font-black text-[#123A52] border-b border-[#123A52]/10">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#123A52]/10">
                {users.map((u) => {
                  const uId = u.id || u._id;
                  return (
                    <tr key={uId} className="hover:bg-[#F5F3EE]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-[#123A52] uppercase">{u.name}</div>
                        <div className="text-[#123A52]/70 text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[#123A52]/80">{u.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          disabled={updatingId === uId}
                          onChange={(e) => handleRoleChange(uId, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#123A52]/20 text-xs font-bold text-[#123A52] focus:outline-none"
                        >
                          <option value="student">student</option>
                          <option value="organizer">organizer</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit ${
                            u.is_active
                              ? 'bg-[#A9CBDD] text-[#123A52]'
                              : 'bg-[#B3453D] text-white'
                          }`}
                        >
                          {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{u.is_active ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#123A52]/70 font-bold">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(uId, u.is_active)}
                          disabled={updatingId === uId}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                            u.is_active
                              ? 'bg-[#B3453D]/10 text-[#B3453D] hover:bg-[#B3453D]/20 border border-[#B3453D]/30'
                              : 'bg-[#123A52] text-white hover:bg-[#2E6E8E]'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
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

export const UserManagement = AdminUsers;
export default AdminUsers;
