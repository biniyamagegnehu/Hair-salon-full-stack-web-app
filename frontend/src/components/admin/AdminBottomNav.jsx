import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Squares2X2Icon, 
  UsersIcon, 
  CalendarDaysIcon, 
  QueueListIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const AdminBottomNav = ({ onMoreClick }) => {
  const navItems = [
    { 
      path: '/admin', 
      label: 'Home', 
      icon: Squares2X2Icon,
      exact: true 
    },
    { 
      path: '/admin/appointments', 
      label: 'Appts', 
      icon: CalendarDaysIcon 
    },
    { 
      path: '/admin/queue', 
      label: 'Queue', 
      icon: QueueListIcon 
    },
    { 
      path: '/admin/customers', 
      label: 'Clients', 
      icon: UsersIcon 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-accent-gold/20 h-20 px-2 flex items-center justify-around lg:hidden z-[1030] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-300 ${
              isActive 
                ? 'text-accent-gold bg-accent-gold/10' 
                : 'text-secondary-brown/60 active:scale-95'
            }`
          }
        >
          <item.icon className={`w-6 h-6 ${({ isActive }) => isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
        </NavLink>
      ))}
      
      <button
        onClick={onMoreClick}
        className="flex flex-col items-center justify-center gap-1 w-16 h-16 text-secondary-brown/60 active:scale-95 rounded-2xl transition-all duration-300"
      >
        <Bars3Icon className="w-6 h-6 stroke-2" />
        <span className="text-[10px] font-black uppercase tracking-tighter">More</span>
      </button>
    </nav>
  );
};

export default AdminBottomNav;
