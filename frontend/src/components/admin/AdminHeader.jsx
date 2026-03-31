import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Bars3BottomLeftIcon, 
  MagnifyingGlassIcon, 
  BellIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const AdminHeader = ({ title, onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="admin-header px-4 sm:px-8 border-b-0 shadow-none bg-transparent" aria-label="Portal Header">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 bg-white shadow-sm border border-accent-gold/10 rounded-xl hover:bg-cream transition-all active:scale-95"
          aria-label="Toggle menu"
        >
          <Bars3BottomLeftIcon className="w-6 h-6 text-black" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight leading-none">{title}</h1>
          <div className="h-1 w-8 bg-accent-gold mt-1 rounded-full hidden sm:block" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Toggle (Mobile) / Search Bar (Desktop) */}
        <div className="hidden md:flex items-center bg-white border border-accent-gold/10 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-accent-gold/20 transition-all">
          <MagnifyingGlassIcon className="w-4 h-4 text-secondary-brown/40 mr-2" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="bg-transparent border-none text-sm font-bold focus:outline-none w-48 lg:w-64"
          />
        </div>
        
        <button className="md:hidden p-2.5 bg-white shadow-sm border border-accent-gold/10 rounded-xl text-black active:scale-95">
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 bg-white shadow-sm border border-accent-gold/10 rounded-xl text-black active:scale-95 group">
          <BellIcon className="w-6 h-6 group-hover:shake transition-transform" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error border-2 border-white rounded-full" />
        </button>

        {/* User Badge */}
        <div 
          className="flex items-center gap-3 p-1.5 pl-3 bg-white shadow-sm border border-accent-gold/10 rounded-2xl cursor-pointer hover:border-accent-gold/30 transition-all active:scale-95"
          aria-label={`Logged in as ${user?.fullName}`}
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-black uppercase leading-tight">{user?.fullName?.split(' ')[0]}</p>
            <p className="text-[10px] font-bold text-accent-gold uppercase tracking-tighter opacity-70">Admin</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black text-accent-gold flex items-center justify-center font-black text-sm border border-accent-gold/20">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <ChevronDownIcon className="w-4 h-4 text-secondary-brown/40 mr-1 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;