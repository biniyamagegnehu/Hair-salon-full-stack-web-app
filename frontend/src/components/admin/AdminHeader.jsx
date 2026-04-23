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
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:pl-6 lg:pr-8" aria-label="Portal Header">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 shadow-sm transition-all hover:bg-zinc-800 hover:text-zinc-50 active:scale-95"
          aria-label="Toggle menu"
        >
          <Bars3BottomLeftIcon className="w-6 h-6" />
        </button>

        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Admin Panel</p>
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-zinc-50">
              {title}
            </h1>
            <span className="hidden sm:inline-flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hidden md:inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 shadow-sm transition hover:border-amber-500/40 hover:text-zinc-50"
        >
          <span className="h-5 w-5 rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-50 flex items-center justify-center">
            ←
          </span>
          <span className="tracking-wide">Back to Site</span>
        </button>

        <div className="hidden xl:flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <CalendarDaysIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Today</p>
            <p className="text-xs font-bold text-zinc-100">{today}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 shadow-sm transition-all focus-within:border-amber-500/50 focus-within:shadow-[0_0_0_2px_rgba(245,158,11,0.2)]">
          <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 border-none bg-transparent text-sm font-medium text-zinc-100 placeholder-zinc-500 focus:outline-none lg:w-64"
          />
        </div>

        <button className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 shadow-sm transition-all hover:text-zinc-50 active:scale-95">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>

        <button className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 shadow-sm transition-all hover:text-zinc-50 active:scale-95">
          <BellIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
        </button>

        <div
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 pl-3 pr-2 shadow-sm cursor-pointer transition-all hover:border-amber-500/50 active:scale-95"
          aria-label={`Logged in as ${user?.fullName}`}
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-zinc-100 leading-tight">{user?.fullName?.split(' ')[0]}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Admin</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-xs font-bold text-amber-500 sm:h-9 sm:w-9">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <ChevronDownIcon className="hidden w-4 h-4 text-zinc-500 sm:block" />
        </div>
      </div>
      </div>
    </header>
  );
};

export default AdminHeader;
