import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Eagerly loaded (critical path)
import Login from './components/Login';
import Register from './components/Register';
import Landing from './components/Landing';
import Layout from './components/Layout';

// Lazy loaded (non-critical)
const EventList = lazy(() => import('./components/EventList'));
const Booking = lazy(() => import('./components/Booking'));
const Payment = lazy(() => import('./components/Payment'));
const QRScanner = lazy(() => import('./components/QRScanner'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Bookings = lazy(() => import('./components/Bookings'));
const EventDetails = lazy(() => import('./components/EventDetails'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const BecomeOrganizer = lazy(() => import('./components/BecomeOrganizer'));

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

// Minimal loading spinner for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#7C5CFF]/30 border-t-[#7C5CFF] rounded-full animate-spin" />
  </div>
);

// Home Logic: Public Landing or Redirect to Dashboard
const HomeRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" />;
    if (user.role === 'ORGANIZER') return <Navigate to="/admin" />;
    if (user.role === 'STAFF') return <Navigate to="/scanner" />;
    return <Navigate to="/discover" />;
  }
  
  return <Landing />;
};

// User Route (Blocks Staff/Admin from user pages)
const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'STAFF') return <Navigate to="/scanner" />;
  if (user.role === 'ADMIN' || user.role === 'ORGANIZER') return <Navigate to="/admin" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return (user?.role === 'ADMIN' || user?.role === 'ORGANIZER') ? <>{children}</> : <Navigate to="/" />;
};

const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return (user?.role === 'STAFF' || user?.role === 'ADMIN') ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomeRoute />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                
                <Route path="/discover" element={<UserRoute><Layout><EventList /></Layout></UserRoute>} />
                <Route path="/event/:eventId" element={<UserRoute><Layout><EventDetails /></Layout></UserRoute>} />
                <Route path="/bookings" element={<UserRoute><Layout><Bookings /></Layout></UserRoute>} />
                <Route path="/book/:eventId" element={<UserRoute><Layout><Booking /></Layout></UserRoute>} />
                <Route path="/payment/:bookingId" element={<UserRoute><Layout><Payment /></Layout></UserRoute>} />
                <Route path="/success" element={<UserRoute><Layout><PaymentSuccess /></Layout></UserRoute>} />
                <Route path="/become-organizer" element={<UserRoute><Layout><BecomeOrganizer /></Layout></UserRoute>} />
                
                <Route path="/scanner" element={<StaffRoute><Layout><QRScanner /></Layout></StaffRoute>} />
                <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
