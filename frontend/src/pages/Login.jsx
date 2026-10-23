import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Check, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (emailToSubmit, passwordToSubmit) => {
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(emailToSubmit.trim(), passwordToSubmit);
      const defaultPath =
        loggedUser?.role === 'admin'
          ? '/admin/overview'
          : loggedUser?.role === 'organizer'
          ? '/organizer/events'
          : '/events';

      const destination = location.state?.from?.pathname || defaultPath;
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLoginSubmit(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 hero-gradient-wash">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#123A52] flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h1 className="text-3xl font-black text-[#123A52] uppercase tracking-tight">Welcome Back</h1>
          <p className="text-[#123A52]/70 text-xs font-semibold mt-1">
            Sign in to manage your symposiums & registrations
          </p>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#123A52]/10 shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#B3453D]/10 border border-[#B3453D]/30 text-[#B3453D] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B3453D]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#123A52] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#123A52]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@symposium.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
                />
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#123A52]/20 text-[#123A52] placeholder-[#123A52]/40 text-xs font-bold focus:outline-none focus:border-[#123A52]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[#123A52] hover:bg-[#2E6E8E] flex items-center justify-center gap-2 mt-6 transition-colors shadow-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-5 border-t border-[#123A52]/10">
            <span className="text-[10px] font-bold text-[#123A52]/70 uppercase tracking-wider block mb-2">
              ⚡ Quick Demo 1-Click Logins:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student1@symposium.edu', 'StudentPass123!')}
                className="py-2.5 px-2 rounded-xl bg-[#A9CBDD] text-[#123A52] font-black text-[10px] uppercase tracking-wider truncate text-center hover:opacity-90 transition-opacity shadow-xs"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer.cs@symposium.edu', 'OrgPass123!')}
                className="py-2.5 px-2 rounded-xl bg-[#5E93B0] text-white font-black text-[10px] uppercase tracking-wider truncate text-center hover:opacity-90 transition-opacity shadow-xs"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@symposium.edu', 'AdminPass123!')}
                className="py-2.5 px-2 rounded-xl bg-[#123A52] text-white font-black text-[10px] uppercase tracking-wider truncate text-center hover:opacity-90 transition-opacity shadow-xs"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#123A52]/70 text-xs font-bold uppercase tracking-wider mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2E6E8E] hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
