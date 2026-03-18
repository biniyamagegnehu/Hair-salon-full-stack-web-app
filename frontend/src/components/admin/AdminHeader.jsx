import React from 'react';
import { useSelector } from 'react-redux';

const AdminHeader = ({ title, onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="admin-header px-4 sm:px-8" aria-label="Portal Header">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-cream rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <span className="text-2xl">☰</span>
        </button>
        <div className="flex flex-col">
          <h1 className="admin-title text-xl sm:text-2xl">{title}</h1>
        </div>
      </div>
      
      <div className="admin-user-badge" aria-label={`Logged in as ${user?.fullName}`}>
        <div className="text-right hidden sm:block">
          <p className="font-bold text-black">{user?.fullName}</p>
          <p className="text-xs text-brown opacity-70">Administrator</p>
        </div>
        <div className="admin-avatar" aria-hidden="true">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;