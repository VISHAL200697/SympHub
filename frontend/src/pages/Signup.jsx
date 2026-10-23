import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { User, Mail, Lock, Building, AlertCircle, ArrowRight, Check } from 'lucide-react';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await signup(formData);
      const destination =
        newUser?.role === 'admin'
          ? '/admin/overview'
          : newUser?.role === 'organizer'
          ? '/organizer/events'
          : '/events';

      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 hero-gradient-wash">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#123A52] flex items-center justify-center mx-auto mb-3 text-white">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h1 className="text-3xl font-black text-[#123A52] uppercase tracking-tight">Create Student Account</h1>
          <p className="text-[#123A52]/70 text-xs font-semibold mt-1">Join Symposi to discover and RSVP for events</p>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#123A52]/10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#B3453D]/10 border border-[#B3453D]/30 text-[#B3453D] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B3453D]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@symposium.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] text-xs font-bold focus:outline-none focus:border-[#123A52]"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#123A52] hover:bg-[#2E6E8E] flex items-center justify-center gap-2 mt-6 transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[#123A52]/70 text-xs font-bold uppercase tracking-wider mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2E6E8E] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
