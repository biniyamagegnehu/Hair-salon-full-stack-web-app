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
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          i18n.language === 'am'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        አማ
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;