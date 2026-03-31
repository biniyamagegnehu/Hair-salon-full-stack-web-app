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
      icon: Squares2X2Icon,
      exact: true 
    },
    { 
      path: '/admin/appointments', 
      label: 'Appointments', 
      icon: CalendarDaysIcon 
    },
    { 
      path: '/admin/queue', 
      label: 'Queue Management', 
      icon: QueueListIcon 
    },
    { 
      path: '/admin/customers', 
      label: 'Customers', 
      icon: UsersIcon 
    },
    { 
      path: '/admin/reports', 
      label: 'Reports', 
      icon: ChartBarIcon 
    },
    {
      path: '/admin/payments',
      label: 'Payments',
      icon: CreditCardIcon
    },
    { 
      path: '/admin/services', 
      label: 'Services', 
      icon: ScissorsIcon 
    },
    { 
      path: '/admin/working-hours', 
      label: 'Working Hours', 
      icon: ClockIcon 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: Cog6ToothIcon 
    }
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-20' : 'lg:w-[280px]'} fixed lg:static h-full transition-all duration-300 ease-in-out border-r border-white/5`}>
      <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
            <h2 className="text-accent-gold text-xl font-black tracking-tighter uppercase mb-0.5">X-MEN</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Salon Admin</p>
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Close menu"
        >
          <XMarkIcon className="w-6 h-6 text-background-cream" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto custom-scrollbar" aria-label="Administrative modules">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => 
              `admin-menu-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0 mx-2' : ''} mb-1`
            }
            title={isCollapsed ? item.label : ''}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`admin-icon w-6 h-6 shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm font-black uppercase tracking-tight truncate animate-in fade-in slide-in-from-left-4 duration-300">
                    {item.label}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-0 w-1 h-6 bg-accent-gold rounded-l-full shadow-[0_0_10px_rgba(201,162,39,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={`admin-menu-item !border-none !bg-transparent hover:!text-error ${isCollapsed ? 'justify-center px-0 mx-2' : ''}`}
          aria-label="Log out"
          title={isCollapsed ? 'Logout' : ''}
        >
          <ArrowLeftOnRectangleIcon className="admin-icon w-6 h-6 shrink-0" />
          {!isCollapsed && <span className="text-sm font-black uppercase tracking-tight animate-in fade-in slide-in-from-left-4 duration-300">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;