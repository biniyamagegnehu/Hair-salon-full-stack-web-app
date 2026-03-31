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
    <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-3 pb-3 pt-2 lg:hidden z-[1030]">
      <div className="absolute inset-x-3 bottom-3 top-0 rounded-[28px] border border-white/70 bg-white/92 shadow-[0_-12px_32px_rgba(15,15,15,0.08)] backdrop-blur-xl" />
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) =>
            `relative z-10 flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl transition-all duration-300 ${
              isActive
                ? 'bg-background-cream text-black shadow-sm'
                : 'text-secondary-brown/60 active:scale-95'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.4px] text-accent-gold' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em]">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}

      <button
        onClick={onMoreClick}
        className="relative z-10 flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl text-secondary-brown/60 transition-all duration-300 active:scale-95"
      >
        <Bars3Icon className="w-6 h-6 stroke-2" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">More</span>
      </button>
    </nav>
  );
};

export default AdminBottomNav;
