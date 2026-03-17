import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import './AuthLayout.css';

const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="auth-layout">
      <div className="auth-lang-switcher">
        <LanguageSwitcher />
      </div>
      
      <div className="auth-card">
        <div className="auth-logo">
          <h1>X Men's Hair Salon</h1>
          <p className="auth-tagline">
            {t('common.tagline', 'Premium grooming for the modern man')}
          </p>
        </div>
        
        <div className="auth-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;