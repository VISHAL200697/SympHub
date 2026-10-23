import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Building2, Tag, PlusCircle, AlertCircle, Trash2 } from 'lucide-react';

export const AdminLookups = () => {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newDeptName, setNewDeptName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [deptError, setDeptError] = useState('');
  const [catError, setCatError] = useState('');
  const [submittingDept, setSubmittingDept] = useState(false);
  const [submittingCat, setSubmittingCat] = useState(false);
  const [deletingDeptId, setDeletingDeptId] = useState(null);
  const [deletingCatId, setDeletingCatId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, catData] = await Promise.all([
        adminApi.getDepartments(),
        adminApi.getCategories(),
      ]);
      setDepartments(deptData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching admin metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setDeptError('');
    setSubmittingDept(true);

    try {
      const created = await adminApi.createDepartment({ name: newDeptName.trim() });
      setDepartments((prev) => [...prev, created]);
      setNewDeptName('');
    } catch (err) {
      console.error('Failed to create department:', err);
      setDeptError(err.response?.data?.detail || 'Failed to create department.');
    } finally {
      setSubmittingDept(false);
    }
  };

  const handleDeleteDepartment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the "${name}" department?`)) return;
    setDeptError('');
    setDeletingDeptId(id);
    try {
      await adminApi.deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => (d.id || d._id) !== id));
    } catch (err) {
      console.error('Failed to delete department:', err);
      setDeptError(err.response?.data?.detail || 'Failed to delete department.');
    } finally {
      setDeletingDeptId(null);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatError('');
    setSubmittingCat(true);

    try {
      const created = await adminApi.createCategory({ name: newCatName.trim() });
      setCategories((prev) => [...prev, created]);
      setNewCatName('');
    } catch (err) {
      console.error('Failed to create category:', err);
      setCatError(err.response?.data?.detail || 'Failed to create category.');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove the "${name}" category?`)) return;
    setCatError('');
    setDeletingCatId(id);
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => (c.id || c._id) !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      setCatError(err.response?.data?.detail || 'Failed to delete category.');
    } finally {
      setDeletingCatId(null);
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
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#123A52]/10 hero-gradient-wash">
        <h1 className="text-2xl sm:text-3xl font-black text-[#123A52] uppercase tracking-tight">
          Departments & Categories Setup
        </h1>
        <p className="text-[#123A52]/70 text-xs font-semibold mt-1">
          Manage institution departments and event classification categories
        </p>
      </div>

      {/* Grid containing two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Departments */}
        <div className="bg-white p-6 rounded-3xl border border-[#123A52]/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A9CBDD] text-[#123A52] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#123A52] uppercase">Academic Departments</h2>
              <span className="text-xs text-[#123A52]/60 font-bold">Total: {departments.length}</span>
            </div>
          </div>

          {/* Add Department Form */}
          <form onSubmit={handleAddDepartment} className="space-y-3">
            {deptError && (
              <div className="p-3 rounded-xl bg-[#B3453D]/10 border border-[#B3453D]/30 text-[#B3453D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deptError}</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="New Department Name..."
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52] placeholder-[#123A52]/40"
              />
              <button
                type="submit"
                disabled={submittingDept}
                className="px-4 py-2.5 rounded-xl bg-[#123A52] hover:bg-[#2E6E8E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
                title="Add new academic department"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{submittingDept ? 'Adding...' : 'Add'}</span>
              </button>
            </div>
          </form>

          {/* Departments List */}
          <div className="divide-y divide-[#123A52]/10 border border-[#123A52]/10 rounded-xl overflow-hidden bg-white">
            {departments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#123A52]/50 font-bold">
                No academic departments added yet.
              </div>
            ) : (
              departments.map((dept) => {
                const deptId = dept.id || dept._id;
                const isDeleting = deletingDeptId === deptId;
                return (
                  <div
                    key={deptId}
                    className="p-3.5 flex items-center justify-between text-xs group hover:bg-[#F5F3EE]/50 transition-colors"
                  >
                    <span className="font-black text-[#123A52] uppercase">{dept.name}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteDepartment(deptId, dept.name)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-[#123A52]/50 hover:text-[#B3453D] hover:bg-[#B3453D]/10 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Remove "${dept.name}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Categories */}
        <div className="bg-white p-6 rounded-3xl border border-[#123A52]/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5E93B0] text-white flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#123A52] uppercase">Event Categories</h2>
              <span className="text-xs text-[#123A52]/60 font-bold">Total: {categories.length}</span>
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="space-y-3">
            {catError && (
              <div className="p-3 rounded-xl bg-[#B3453D]/10 border border-[#B3453D]/30 text-[#B3453D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{catError}</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="New Category Name..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52] placeholder-[#123A52]/40"
              />
              <button
                type="submit"
                disabled={submittingCat}
                className="px-4 py-2.5 rounded-xl bg-[#123A52] hover:bg-[#2E6E8E] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                title="Add new event category"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{submittingCat ? 'Adding...' : 'Add'}</span>
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="divide-y divide-[#123A52]/10 border border-[#123A52]/10 rounded-xl overflow-hidden bg-white">
            {categories.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#123A52]/50 font-bold">
                No event categories added yet.
              </div>
            ) : (
              categories.map((cat) => {
                const catId = cat.id || cat._id;
                const isDeleting = deletingCatId === catId;
                return (
                  <div
                    key={catId}
                    className="p-3.5 flex items-center justify-between text-xs group hover:bg-[#F5F3EE]/50 transition-colors"
                  >
                    <span className="font-black text-[#123A52] uppercase">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(catId, cat.name)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-[#123A52]/50 hover:text-[#B3453D] hover:bg-[#B3453D]/10 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Remove "${cat.name}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DepartmentsCategories = AdminLookups;
export default AdminLookups;
