import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: '📊',
      exact: true 
    },
    { 
      path: '/admin/customers', 
      label: 'Customers', 
      icon: '👥' 
    },
    { 
      path: '/admin/appointments', 
      label: 'Appointments', 
      icon: '📅' 
    },
    { 
      path: '/admin/queue', 
      label: 'Queue Management', 
      icon: '🔄' 
    },
    { 
      path: '/admin/reports', 
      label: 'Reports', 
      icon: '📊' 
    },
    {
      path: '/admin/payments',
      label: 'Payments',
      icon: '💳'
    },
    { 
      path: '/admin/services', 
      label: 'Services', 
      icon: '💇' 
    },
    { 
      path: '/admin/working-hours', 
      label: 'Working Hours', 
      icon: '⏰' 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: '⚙️' 
    }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        <p className="text-sm text-gray-400 mt-1">X Men's Hair Salon</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 mt-4 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <span className="mr-3 text-lg">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;