import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, logout } from '../store/slices/authSlice';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              ✂️ X Men's Hair Salon
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                {t('nav.home')}
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                {t('nav.services')}
              </Link>
              <Link to="/queue" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                {t('nav.queue')}
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/booking" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    {t('nav.booking')}
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    {t('nav.profile')}
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    {t('nav.register')}
                  </Link>
                </>
              )}
              
              {/* Language Switcher */}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 X Men's Hair Salon. {t('common.allRightsReserved', 'All rights reserved.')}</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;