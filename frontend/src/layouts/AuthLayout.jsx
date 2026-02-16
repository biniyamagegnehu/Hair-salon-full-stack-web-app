import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">✂️ X Men's Hair Salon</h1>
          <p className="text-gray-600 mt-2">Premium grooming for Ethiopian men</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;