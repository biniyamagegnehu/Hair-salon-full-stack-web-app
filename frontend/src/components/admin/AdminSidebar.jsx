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
      className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-72'}`}
    >
      <div className={`flex h-20 items-center border-b border-zinc-800 px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Workspace</span>
            <span className="text-xl font-bold tracking-tight text-zinc-50">X-MEN Admin</span>
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-50"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Desktop toggle collapse */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-all"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 no-scrollbar" aria-label="Administrative modules">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`truncate text-sm font-medium ${isActive ? 'text-amber-500' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                      {item.label}
                    </span>
                    <span className="truncate text-[10px] font-medium text-zinc-500">
                      {item.description}
                    </span>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-zinc-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          aria-label="Log out"
          title={isCollapsed ? 'Logout' : ''}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">Logout</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
