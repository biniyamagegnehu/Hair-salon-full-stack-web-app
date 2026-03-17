import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/customers')) return 'Customer Management';
    if (path.includes('/appointments')) return 'Appointment Management';
    if (path.includes('/services')) return 'Service Management';
    if (path.includes('/working-hours')) return 'Working Hours';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/queue')) return 'Queue Management';
    if (path.includes('/reports')) return 'Business Reports';
    if (path.includes('/payments')) return 'Payment Records';
    return 'Admin Panel';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader title={getPageTitle()} />
        <main className="admin-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ width: '100%', height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;