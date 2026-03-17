import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { authService } from '../../services/api/auth';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    
    // Save to backend if user is logged in
    try {
      await authService.updateLanguage(lng);
    } catch (error) {
      console.log('Language preference saved locally');
    }
  };

  return (
    <div className="flex items-center space-x-2 ml-4">
      <button
        onClick={() => changeLanguage('am')}
        className={`px-3 py-1 rounded-md text-sm font-semibold transition-all duration-300 border-2 ${
          i18n.language === 'am'
            ? 'border-accent-gold bg-accent-gold text-black'
            : 'border-accent-gold text-accent-gold hover:bg-gold-transparent'
        }`}
        style={{
          borderColor: 'var(--accent-gold)',
          color: i18n.language === 'am' ? 'var(--primary-black)' : 'var(--accent-gold)',
          backgroundColor: i18n.language === 'am' ? 'var(--accent-gold)' : 'transparent'
        }}
      >
        አማ
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-semibold transition-all duration-300 border-2 ${
          i18n.language === 'en'
            ? 'border-accent-gold bg-accent-gold text-black'
            : 'border-accent-gold text-accent-gold hover:bg-gold-transparent'
        }`}
        style={{
          borderColor: 'var(--accent-gold)',
          color: i18n.language === 'en' ? 'var(--primary-black)' : 'var(--accent-gold)',
          backgroundColor: i18n.language === 'en' ? 'var(--accent-gold)' : 'transparent'
        }}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;