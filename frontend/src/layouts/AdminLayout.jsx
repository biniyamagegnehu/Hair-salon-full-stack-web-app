/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminBottomNav from '../components/admin/AdminBottomNav';
import AdminBreadcrumbs from '../components/admin/AdminBreadcrumbs';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = React.useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/customers')) return 'Customers';
    if (path.includes('/appointments')) return 'Appointments';
    if (path.includes('/services')) return 'Services';
    if (path.includes('/working-hours')) return 'Working Hours';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/queue')) return 'Queue';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/payments')) return 'Payments';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-background-cream text-text-black">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-primary-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isDesktopSidebarCollapsed}
        onToggleCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-0">
        <AdminHeader
          title={getPageTitle()}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="px-4 pb-24 pt-4 sm:px-6 lg:pl-6 lg:pr-8">
          <div className="mx-auto max-w-[1400px]">
            <AdminBreadcrumbs />
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pb-8"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <AdminBottomNav onMoreClick={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
};

export default AdminLayout;
