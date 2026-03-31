import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { login, googleLogin, clearError } from '../../store/slices/authSlice';
import Card, { CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';

const LoginPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ identifier, password }));
    if (login.fulfilled.match(result)) {
      // Login successful
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await dispatch(googleLogin(credentialResponse.credential));
    if (googleLogin.fulfilled.match(result)) {
      if (result.payload.requiresPhoneUpdate) {
        navigate('/profile?phoneRequired=true');
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 lg:flex-row lg:items-stretch">
      <div className="hidden w-full max-w-sm flex-col justify-between rounded-[28px] border border-black/5 bg-primary-black px-8 py-10 text-white lg:flex">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent-gold/80">X Men&apos;s Hair Salon</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em]">Premium grooming access.</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Sign in to manage bookings, queue status, and your profile in a calm, focused interface.
          </p>
        </div>
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs font-medium text-white/70">Saved appointments</span>
            <span className="text-sm font-semibold text-accent-gold">Always synced</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs font-medium text-white/70">Queue visibility</span>
            <span className="text-sm font-semibold text-accent-gold">Real-time</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:max-w-md">
      <div className="text-center mb-8">
        <Badge variant="gold" className="mb-3">Welcome Back</Badge>
        <h2 className="text-3xl font-black text-black tracking-tight sm:text-4xl">
          {t('auth.login')}
        </h2>
        <p className="text-secondary-brown font-bold opacity-40 mt-1 italic">Access your premium grooming portal</p>
      </div>
      
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <p className="uppercase tracking-widest opacity-60 mb-1">{t('common.error')}</p>
          <p>{error}</p>
        </div>
      )}

      <Card className="mb-6">
        <CardBody className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                {t('auth.email')} / {t('auth.phone')}
              </label>
              <Input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('auth.email')}
                required
                fullWidth
                noMargin
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  fullWidth
                  noMargin
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-brown opacity-40 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="black"
              isLoading={isLoading}
              fullWidth
              className="mt-4"
            >
              {t('auth.login')}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-white text-secondary-brown opacity-40">{t('common.or')}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>
        </CardBody>
      </Card>

      <p className="text-center text-sm font-medium text-secondary-brown/70">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-gold hover:text-black transition-colors underline decoration-2 underline-offset-4">
          {t('auth.register')}
        </Link>
      </p>
      </div>
    </div>
  );
};

export default LoginPage;