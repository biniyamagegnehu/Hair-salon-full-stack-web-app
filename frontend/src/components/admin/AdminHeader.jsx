import React from 'react';
import { useSelector } from 'react-redux';

const AdminHeader = ({ title }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;