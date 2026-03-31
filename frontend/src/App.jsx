import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { getCurrentUser } from './store/slices/authSlice'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer Pages
import HomePage from './pages/customer/HomePage'
import ServicesPage from './pages/customer/ServicesPage'
import BookingPage from './pages/customer/BookingPage'
import QueuePage from './pages/customer/QueuePage'
import ProfilePage from './pages/customer/ProfilePage'
import PaymentPage from './pages/customer/PaymentPage'
import PaymentCallbackPage from './pages/customer/PaymentCallbackPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminServices from './pages/admin/AdminServices'
import AdminWorkingHours from './pages/admin/AdminWorkingHours'
import AdminSettings from './pages/admin/AdminSettings'
import AdminQueue from './pages/admin/AdminQueue'  
import AdminReports from './pages/admin/AdminReports';
import AdminPayments from './pages/admin/AdminPayments';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    dispatch(getCurrentUser()).finally(() => {
      setIsInitializing(false);
    });
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-gold border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* ===== AUTH ROUTES ===== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ===== MAIN CUSTOMER ROUTES ===== */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/queue" element={<QueuePage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/booking" element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/:appointmentId" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/callback/:appointmentId" element={
            <ProtectedRoute>
              <PaymentCallbackPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          {/* Admin Dashboard */}
          <Route index element={<AdminDashboard />} />
          
          {/* Customer Management */}
          <Route path="customers" element={<AdminCustomers />} />
          
          {/* Appointment Management */}
          <Route path="appointments" element={<AdminAppointments />} />
          
          {/* Queue Management - NEW */}
          <Route path="queue" element={<AdminQueue />} />

          {/* Payments History */}
          <Route path="payments" element={<AdminPayments />} />

          <Route path="reports" element={<AdminReports />} />
          
          {/* Service Management */}
          <Route path="services" element={<AdminServices />} />
          
          {/* Working Hours */}
          <Route path="working-hours" element={<AdminWorkingHours />} />
          
          {/* Settings */}
          <Route path="settings" element={<AdminSettings />} />
          
          {/* Catch-all for admin routes - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        {/* ===== 404 FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App