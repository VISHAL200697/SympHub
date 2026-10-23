import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute, PublicRoute, getDashboardPath } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { MyRegistrations } from './pages/MyRegistrations';
import { OrganizerEvents } from './pages/OrganizerEvents';
import { EventForm } from './pages/EventForm';
import { Attendees } from './pages/Attendees';
import { AdminOverview } from './pages/AdminOverview';
import { AdminUsers } from './pages/AdminUsers';
import { AdminLookups } from './pages/AdminLookups';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user)} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#F5F3EE] text-[#123A52] flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 pb-16">
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <ProtectedRoute>
                    <EventDetail />
                  </ProtectedRoute>
                }
              />

              {/* Student Routes */}
              <Route
                path="/my-registrations"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <MyRegistrations />
                  </ProtectedRoute>
                }
              />

              {/* Organizer Routes */}
              <Route
                path="/organizer/events"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/new"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <EventForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events/:id/registrations"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <Attendees />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/overview"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/lookups"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLookups />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments-categories"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLookups />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-[#123A52]/10 py-6 text-center text-xs text-[#123A52]/70 bg-white/60 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-bold">&copy; 2026 SympoHub &mdash; Symposium & Workshop Management Platform</span>
              <span className="text-[#2E6E8E] font-extrabold uppercase tracking-wider">MERN Stack Architecture</span>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
