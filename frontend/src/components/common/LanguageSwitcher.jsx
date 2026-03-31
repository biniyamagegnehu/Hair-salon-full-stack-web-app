import React from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api/auth';

const buttonClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
    active
      ? 'bg-[#C9A227] text-[#0F0F0F] shadow-sm'
      : 'bg-white text-[#3B2F2F] hover:bg-[#F8F4EC]'
  }`;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);

    try {
      await authService.updateLanguage(lng);
    } catch {
      console.log('Language preference saved locally');
    }
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/80 p-1 shadow-sm">
      <button type="button" onClick={() => changeLanguage('am')} className={buttonClass(i18n.language === 'am')}>
        አማ
      </button>
      <button type="button" onClick={() => changeLanguage('en')} className={buttonClass(i18n.language === 'en')}>
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
