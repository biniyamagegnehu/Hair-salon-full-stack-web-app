import React from 'react';
import { useSelector } from 'react-redux';

const AdminHeader = ({ title }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="admin-header" aria-label="Portal Header">
      <div className="flex flex-col">
        <h1 className="admin-title">{title}</h1>
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