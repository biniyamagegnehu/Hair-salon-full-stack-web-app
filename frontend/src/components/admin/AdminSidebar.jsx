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
      icon: '📈' 
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
    <aside className="admin-sidebar">
      <div className="p-8 border-b border-white/5">
        <h2 className="text-accent-gold text-xl font-black tracking-tighter uppercase mb-1">X-MEN</h2>
        <p className="text-xs font-bold uppercase tracking-widest opacity-50">Salon Admin</p>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto" aria-label="Administrative modules">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `admin-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="admin-icon" role="img" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="admin-menu-item w-full !border-none !bg-transparent hover:!text-error"
          aria-label="Log out of administrator account"
        >
          <span className="admin-icon" role="img" aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;