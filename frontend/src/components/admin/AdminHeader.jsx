import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Bars3BottomLeftIcon,
  MagnifyingGlassIcon,
  BellIcon,
  CalendarDaysIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const AdminHeader = ({ title, onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-black/8 bg-background-cream/90 px-4 py-4 backdrop-blur sm:px-6 lg:pl-6 lg:pr-8" aria-label="Portal Header">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-black/8 bg-white/80 shadow-sm transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          <Bars3BottomLeftIcon className="w-6 h-6 text-black" />
        </button>

        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.28em] text-secondary-brown/50">Admin Panel</p>
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="truncate text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.04em] text-black">
              {title}
            </h1>
            <span className="hidden sm:inline-flex h-2.5 w-2.5 rounded-full bg-accent-gold shadow-[0_0_0_6px_rgba(201,162,39,0.14)]" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-primary-black/5 bg-white/80 px-3 py-2 text-xs font-semibold text-secondary-brown/80 shadow-sm transition hover:border-accent-gold/40 hover:text-primary-black"
        >
          <span className="h-6 w-6 rounded-full bg-background-cream text-xs font-bold text-primary-black flex items-center justify-center">
            ←
          </span>
          <span className="tracking-wide">Back to website</span>
        </button>

        <div className="hidden xl:flex items-center gap-3 rounded-2xl border border-white/65 bg-white/82 px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background-cream text-accent-gold">
            <CalendarDaysIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-secondary-brown/45">Today</p>
            <p className="text-sm font-medium text-black">{today}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center rounded-2xl border border-white/65 bg-white/82 px-4 py-3 shadow-sm transition-all focus-within:border-accent-gold/35 focus-within:shadow-[0_0_0_4px_rgba(201,162,39,0.12)]">
          <MagnifyingGlassIcon className="w-4 h-4 text-secondary-brown/40 mr-3" />
          <input
            type="text"
            placeholder="Search appointments, clients, or services"
            className="w-48 border-none bg-transparent text-sm font-medium text-black focus:outline-none lg:w-72"
          />
        </div>

        <button className="md:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-black/8 bg-white/82 text-black shadow-sm active:scale-95">
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>

        <button className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-black/8 bg-white/82 text-black shadow-sm active:scale-95">
          <BellIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error border-2 border-white rounded-full" />
        </button>

        <div
          className="flex items-center gap-3 rounded-2xl border border-white/65 bg-white/88 py-1.5 pl-3 pr-2 shadow-sm cursor-pointer transition-all hover:border-accent-gold/30 active:scale-95"
          aria-label={`Logged in as ${user?.fullName}`}
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-black leading-tight">{user?.fullName?.split(' ')[0]}</p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-secondary-brown/55">Administrator</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-gold/20 bg-black text-sm font-semibold text-accent-gold sm:h-10 sm:w-10">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <ChevronDownIcon className="hidden w-4 h-4 mr-1 text-secondary-brown/40 sm:block" />
        </div>
      </div>
      </div>
    </header>
  );
};

export default AdminHeader;
