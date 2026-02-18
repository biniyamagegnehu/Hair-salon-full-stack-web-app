import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Main Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/queue" element={<QueuePage />} />
          
          {/* Protected Routes */}
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
      </Routes>
    </>
  )
}

export default App