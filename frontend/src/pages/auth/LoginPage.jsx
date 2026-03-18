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
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <Badge variant="gold" className="mb-4">Welcome Back</Badge>
        <h2 className="text-4xl font-black text-black uppercase tracking-tight">
          {t('auth.login')}
        </h2>
        <p className="text-secondary-brown font-bold opacity-40 mt-1 italic">Access your premium grooming portal</p>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl font-bold text-xs mb-8">
          <p className="uppercase tracking-widest opacity-60 mb-1">{t('common.error')}</p>
          <p>{error}</p>
        </div>
      )}

      <Card className="mb-8">
        <CardBody className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary"></div>
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

      <p className="text-center text-sm font-bold text-secondary-brown opacity-60">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-gold hover:text-black transition-colors underline decoration-2 underline-offset-4">
          {t('auth.register')}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;