import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, logout } from '../store/slices/authSlice';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import Button from '../components/ui/Button/Button';
import './MainLayout.css';

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUser());
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/queue', label: t('nav.queue') },
  ];

  if (isAuthenticated) {
    navLinks.push({ path: '/booking', label: t('nav.booking') });
    navLinks.push({ path: '/profile', label: t('nav.profile') });
    if (user?.role === 'ADMIN') {
      navLinks.push({ path: '/admin', label: t('nav.admin') });
    }
  }

  return (
    <div className={`main-layout ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Header */}
      <header className={`header-sticky ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container nav-container">
          <Link to="/" className="logo-text">
            X Men's Hair Salon
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="nav-links">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-10">
              <LanguageSwitcher />
              
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  {t('nav.logout')}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="nav-link !p-2">{t('nav.login')}</Link>
                  <Button 
                    variant="gold" 
                    size="sm" 
                    onClick={() => navigate('/register')}
                  >
                    {t('nav.register')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-accent-gold"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="mobile-menu-drawer">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold border-b-2 border-accent-gold">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-accent-gold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="py-4 border-t border-black/5 mt-4">
                <LanguageSwitcher />
              </div>
              
              {isAuthenticated ? (
                <Button variant="primary" fullWidth onClick={handleLogout}>{t('nav.logout')}</Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="outline" fullWidth onClick={() => navigate('/login')}>{t('nav.login')}</Button>
                  <Button variant="gold" fullWidth onClick={() => navigate('/register')}>{t('nav.register')}</Button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-grow py-8 bg-cream animate-fade-in">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h3 className="logo-text !text-accent-gold mb-6 inline-block">X Men's Hair Salon</h3>
              <p className="opacity-80 leading-relaxed mb-6">
                Premium grooming for the modern man. Experience the best haircuts, beard trims, and styling in a sophisticated atmosphere.
              </p>
              <div className="social-icons">
                <a href="#" className="social-icon">FB</a>
                <a href="#" className="social-icon">IG</a>
                <a href="#" className="social-icon">TW</a>
              </div>
            </div>
            
            <div>
              <h4 className="footer-heading">Quick Links</h4>
              <nav>
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/services" className="footer-link">Services</Link>
                <Link to="/queue" className="footer-link">Queue Status</Link>
                <Link to="/booking" className="footer-link">Book Appointment</Link>
              </nav>
            </div>
            
            <div>
              <h4 className="footer-heading">Visit Us</h4>
              <p className="opacity-80 mb-2">123 Grooming St, Style City</p>
              <p className="opacity-80 mb-4">+1 (234) 567-890</p>
              <h4 className="footer-heading !mb-4 mt-8">Hours</h4>
              <p className="opacity-80">Mon - Sat: 9:00 AM - 8:00 PM</p>
              <p className="opacity-80">Sun: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="opacity-60 text-sm italic">
              &copy; {new Date().getFullYear()} X Men's Hair Salon. {t('common.allRightsReserved')}
            </p>
            <div className="flex gap-6 text-xs opacity-60">
              <a href="#" className="hover:text-accent-gold">Privacy Policy</a>
              <a href="#" className="hover:text-accent-gold">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      {isScrolled && (
        <button className="back-to-top animate-fade-in" onClick={scrollToTop}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MainLayout;