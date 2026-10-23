import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Check, Calendar, LogOut, PlusCircle, BookmarkCheck, Shield, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#F5F3EE]/95 backdrop-blur-md border-b border-[#123A52]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo Lockup */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#123A52] flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#123A52] uppercase">
              SympoHub
            </span>
            <span className="text-[10px] tracking-wider uppercase text-[#5E93B0] font-bold -mt-1">
              Event Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated && (
            <Link
              to="/events"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${isActive('/events')
                  ? 'bg-[#123A52] text-white'
                  : 'text-[#123A52] hover:bg-[#A9CBDD]/30'
                }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Discover Events</span>
            </Link>
          )}

          {isAuthenticated && isStudent && (
            <Link
              to="/my-registrations"
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${isActive('/my-registrations')
                  ? 'bg-[#123A52] text-white'
                  : 'text-[#123A52] hover:bg-[#A9CBDD]/30'
                }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>My Registrations</span>
            </Link>
          )}

          {isAuthenticated && (isOrganizer || isAdmin) && (
            <>
              <Link
                to="/organizer/events"
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${isActive('/organizer/events')
                    ? 'bg-[#123A52] text-white'
                    : 'text-[#123A52] hover:bg-[#A9CBDD]/30'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Events</span>
              </Link>
              <Link
                to="/organizer/events/new"
                className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2E6E8E] text-white hover:bg-[#123A52] transition-colors flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Host Event</span>
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <div className="pl-2 border-l border-[#123A52]/20 flex items-center space-x-1">
              <Link
                to="/admin/overview"
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1.5 ${isActive('/admin/overview') || location.pathname.startsWith('/admin')
                    ? 'bg-[#123A52] text-white'
                    : 'text-[#123A52] hover:bg-[#A9CBDD]/30'
                  }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Profile / Auth Action */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#123A52]">{user.name}</span>
                <span className="text-[10px] uppercase font-extrabold text-[#2E6E8E]">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-[#123A52] hover:bg-[#B3453D]/10 hover:text-[#B3453D] border border-[#123A52]/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive('/login')
                    ? 'bg-[#123A52] text-white'
                    : 'text-[#123A52] hover:bg-[#A9CBDD]/30'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive('/signup')
                    ? 'bg-[#123A52] text-white'
                    : 'bg-[#123A52] text-white hover:bg-[#2E6E8E]'
                }`}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
