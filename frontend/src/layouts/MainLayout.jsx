import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, logout } from '../store/slices/authSlice';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const navButtonClasses = {
  primary: 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg',
  gold: 'bg-[#C9A227] text-[#0F0F0F] px-6 py-3 rounded-lg hover:bg-[#DAA520] transition-all duration-300 font-medium shadow-md',
  outline: 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300'
};

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    { path: '/queue', label: t('nav.queue') }
  ];

  if (isAuthenticated) {
    navLinks.push({ path: '/booking', label: t('nav.booking') });
    navLinks.push({ path: '/profile', label: t('nav.profile') });
    if (user?.role === 'ADMIN') {
      navLinks.push({ path: '/admin', label: t('nav.admin') });
    }
  }

  const footerLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/queue', label: 'Queue Status' },
    { path: '/booking', label: 'Book Appointment' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#1A1A1A]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(201,162,39,0.14),transparent_22%),linear-gradient(180deg,#fdfbf7_0%,#f8f4ec_45%,#f3ede1_100%)]" />

      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-black/5 bg-[#F8F4EC]/90 shadow-sm backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-6">
            <Link to="/" className="min-w-0">
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-[0.32em] text-[#3B2F2F]/55">Premium Grooming</span>
                <span className="mt-1 text-xl sm:text-2xl font-bold tracking-[-0.04em] text-[#0F0F0F]">
                  X Men&apos;s Hair Salon
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <nav className="flex items-center gap-1 rounded-full border border-white/70 bg-white/80 p-1 shadow-sm">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-[#0F0F0F] text-white shadow-md'
                          : 'text-[#3B2F2F]/75 hover:bg-[#F8F4EC] hover:text-[#0F0F0F]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center gap-4">
                <LanguageSwitcher />

                {isAuthenticated ? (
                  <button type="button" onClick={handleLogout} className={navButtonClasses.outline}>
                    {t('nav.logout')}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => navigate('/login')} className="px-4 py-3 text-sm font-medium text-[#3B2F2F] transition-colors hover:text-[#0F0F0F]">
                      {t('nav.login')}
                    </button>
                    <button type="button" onClick={() => navigate('/register')} className={navButtonClasses.gold}>
                      {t('nav.register')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="lg:hidden flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white/80 text-[#0F0F0F] shadow-sm"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0F0F0F]/45 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm border-l border-black/5 bg-[#F8F4EC] shadow-2xl">
            <div className="flex h-full flex-col px-6 pb-8 pt-6">
              <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#3B2F2F]/50">Navigation</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#0F0F0F]">Explore X Men</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white/80 text-[#0F0F0F]"
                  aria-label="Close menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="mt-6 flex flex-1 flex-col gap-3">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`rounded-2xl px-4 py-4 text-base font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-[#0F0F0F] text-white shadow-md'
                          : 'bg-white/80 text-[#1A1A1A] shadow-sm hover:bg-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="mt-4 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-sm">
                  <p className="text-sm font-medium text-[#3B2F2F]/70">Choose your language</p>
                  <div className="mt-4">
                    <LanguageSwitcher />
                  </div>
                </div>
              </nav>

              {isAuthenticated ? (
                <button type="button" onClick={handleLogout} className={`${navButtonClasses.outline} w-full`}>
                  {t('nav.logout')}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => navigate('/login')} className={`${navButtonClasses.outline} w-full`}>
                    {t('nav.login')}
                  </button>
                  <button type="button" onClick={() => navigate('/register')} className={`${navButtonClasses.gold} w-full`}>
                    {t('nav.register')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pb-12 pt-6 sm:pt-8 lg:pt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <footer className="mt-8 border-t border-black/5 bg-[#0F0F0F] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-[#C9A227]/80">X Men Salon</p>
              <h3 className="mt-4 text-3xl font-bold tracking-[-0.04em]">Professional grooming with modern rhythm.</h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/68">
                Premium haircuts, beard care, and queue-aware booking designed for customers who want a polished experience from arrival to finish.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium uppercase tracking-[0.24em] text-[#C9A227]">Quick Links</h4>
              <div className="mt-6 grid grid-cols-1 gap-3">
                {footerLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="text-sm text-white/70 transition-colors hover:text-[#C9A227]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium uppercase tracking-[0.24em] text-[#C9A227]">Visit Us</h4>
              <div className="mt-6 space-y-3 text-sm text-white/70">
                <p>Addis Ababa, Ethiopia</p>
                <p>+251 911 22 33 44</p>
                <p>contact@xmenhairsalon.com</p>
              </div>
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/45">Hours</p>
                <p className="mt-3 text-sm text-white/78">Mon - Sat: 9:00 AM - 8:00 PM</p>
                <p className="mt-1 text-sm text-white/78">Sun: 10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} X Men&apos;s Hair Salon. {t('common.allRightsReserved')}</p>
            <div className="flex gap-6">
              <a href="#" className="transition-colors hover:text-[#C9A227]">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-[#C9A227]">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {isScrolled && (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A227] text-[#0F0F0F] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MainLayout;
