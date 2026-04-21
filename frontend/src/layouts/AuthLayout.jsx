import React from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background-cream relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Abstract background blobs for modern feel on the main wrapper */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-gold/5 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-brown/5 blur-[150px]"></div>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-[1200px] flex-1 flex flex-col justify-center min-h-[700px] relative z-10">
        <div className="w-full rounded-[2.5rem] bg-white shadow-2xl shadow-black/5 ring-1 ring-black/[0.03] overflow-hidden flex flex-col lg:flex-row h-full lg:min-h-[750px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
