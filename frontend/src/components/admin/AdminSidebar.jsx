import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/customers', label: 'Customers', icon: '👥' },
    { path: '/admin/appointments', label: 'Appointments', icon: '📅' },
    { path: '/admin/services', label: 'Services', icon: '💇' },
    { path: '/admin/working-hours', label: 'Working Hours', icon: '⏰' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-800 ${isActive ? 'bg-gray-800 border-l-4 border-primary-500' : ''}`
            }
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;