import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <LanguageSwitcher />
      </div>
      
      <div className="mx-auto mt-6 grid w-full max-w-6xl gap-6 rounded-[32px] border border-black/8 bg-white p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <div className="rounded-[28px] bg-primary-black p-8 text-white">
          <h1 className="text-3xl font-bold tracking-tight">X Men&apos;s Hair Salon</h1>
          <p className="mt-4 text-base text-white/75">
            {t('common.tagline', 'Premium grooming for the modern man')}
          </p>
          <p className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Secure access to bookings, profile, and premium service management.
          </p>
        </div>
        
        <div className="rounded-[28px] bg-background-cream/55 p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
