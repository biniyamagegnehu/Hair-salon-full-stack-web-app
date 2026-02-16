import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer Pages (placeholder)
const HomePage = () => <div className="p-8"><h1 className="text-3xl">Home Page</h1></div>
const ServicesPage = () => <div className="p-8"><h1 className="text-3xl">Services Page</h1></div>
const QueuePage = () => <div className="p-8"><h1 className="text-3xl">Queue Page</h1></div>
const BookingPage = () => <div className="p-8"><h1 className="text-3xl">Booking Page</h1></div>
const ProfilePage = () => <div className="p-8"><h1 className="text-3xl">Profile Page</h1></div>

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
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
      </Route>
    </Routes>
  )
}

export default App