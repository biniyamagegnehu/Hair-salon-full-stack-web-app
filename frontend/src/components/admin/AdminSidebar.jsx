import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  Squares2X2Icon,
  UsersIcon,
  CalendarDaysIcon,
  QueueListIcon,
  ChartBarIcon,
  CreditCardIcon,
  ScissorsIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
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
      description: 'Performance overview',
      icon: Squares2X2Icon,
      exact: true
    },
    {
      path: '/admin/appointments',
      label: 'Appointments',
      description: 'Bookings and schedules',
      icon: CalendarDaysIcon
    },
    {
      path: '/admin/queue',
      label: 'Queue Management',
      description: 'Walk-ins and live flow',
      icon: QueueListIcon
    },
    {
      path: '/admin/customers',
      label: 'Customers',
      description: 'Profiles and engagement',
      icon: UsersIcon
    },
    {
      path: '/admin/reports',
      label: 'Reports',
      description: 'Insights and growth',
      icon: ChartBarIcon
    },
    {
      path: '/admin/payments',
      label: 'Payments',
      description: 'Transactions and status',
      icon: CreditCardIcon
    },
    {
      path: '/admin/services',
      label: 'Services',
      description: 'Catalog and pricing',
      icon: ScissorsIcon
    },
    {
      path: '/admin/working-hours',
      label: 'Working Hours',
      description: 'Availability settings',
      icon: ClockIcon
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      description: 'Security and preferences',
      icon: Cog6ToothIcon
    }
  ];

  return (
    <aside
      className={`admin-sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-20' : 'lg:w-[280px]'} fixed lg:static h-full transition-all duration-300 ease-in-out`}
    >
      <div className={`px-6 py-7 border-b border-white/8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Operations Suite</p>
            <h2 className="text-accent-gold text-[1.75rem] font-semibold tracking-[-0.04em] leading-none">X-MEN</h2>
            <p className="mt-2 text-[13px] font-medium text-white/58">Salon administration</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Close menu"
        >
          <XMarkIcon className="w-6 h-6 text-background-cream" />
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2.5 rounded-xl bg-white/5 transition-colors text-white/50 hover:bg-white/10 hover:text-white"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-6 py-5 border-b border-white/8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/42">Workspace</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Manage bookings, queue flow, customers, and business health from one aligned control center.
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar" aria-label="Administrative modules">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `admin-menu-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0 mx-2' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            {({ isActive }) => (
              <>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${isActive ? 'bg-accent-gold text-black shadow-[0_10px_20px_rgba(201,162,39,0.18)]' : 'bg-white/6 text-white/70'}`}>
                  <item.icon className={`admin-icon w-5 h-5 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-4 duration-300">
                    <span className="block truncate text-sm font-medium tracking-[-0.01em]">
                      {item.label}
                    </span>
                    <span className={`block truncate text-xs mt-0.5 ${isActive ? 'text-white/72' : 'text-white/40'}`}>
                      {item.description}
                    </span>
                  </div>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-4 h-8 w-1 rounded-full bg-accent-gold shadow-[0_0_16px_rgba(201,162,39,0.55)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/8">
        <button
          onClick={handleLogout}
          className={`admin-menu-item !mb-0 !border-none !bg-transparent hover:!text-red-300 ${isCollapsed ? 'justify-center px-0 mx-2' : ''}`}
          aria-label="Log out"
          title={isCollapsed ? 'Logout' : ''}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/6">
            <ArrowLeftOnRectangleIcon className="admin-icon w-5 h-5 shrink-0" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300 text-left">
              <span className="block text-sm font-medium tracking-[-0.01em]">Logout</span>
              <span className="block text-xs mt-0.5 text-white/40">End the current admin session</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
