import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">X Men's Hair Salon</h2>
          <p className="mt-2 text-sm text-gray-600">Premium grooming for Ethiopian men</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;