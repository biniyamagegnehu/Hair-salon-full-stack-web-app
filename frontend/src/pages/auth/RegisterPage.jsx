import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { register, googleLogin, clearError } from '../../store/slices/authSlice';
import Card, { CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';

const RegisterPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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

  const validatePhoneNumber = (phone) => {
    const ethiopianPhoneRegex = /^\+251[79]\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6 && /\d/.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(formData.phoneNumber)) {
      alert('Please enter a valid Ethiopian phone number (+251XXXXXXXXX)');
      return;
    }

    if (!validatePassword(formData.password)) {
      alert('Password must be at least 6 characters and contain at least one number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const userData = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      password: formData.password
    };

    if (formData.email) {
      userData.email = formData.email;
    }

    const result = await dispatch(register(userData));
    if (register.fulfilled.match(result)) {
      // Registration successful
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
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent-gold/80">Join X Men&apos;s</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em]">Designed for returning clients.</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Create an account to keep your appointments, queue status, and preferences perfectly in sync.
          </p>
        </div>
        <div className="mt-10 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs font-medium text-white/70">Faster booking</span>
            <span className="text-sm font-semibold text-accent-gold">One tap</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-xs font-medium text-white/70">Profile-aware service</span>
            <span className="text-sm font-semibold text-accent-gold">Personalized</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:max-w-md">
      <div className="text-center mb-8">
        <Badge variant="gold" className="mb-3">New Engagement</Badge>
        <h2 className="text-3xl font-black text-black tracking-tight sm:text-4xl">
          {t('auth.register')}
        </h2>
        <p className="text-secondary-brown font-bold opacity-40 mt-1 italic">Join the exclusive X Men's circle</p>
      </div>
      
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          <p className="uppercase tracking-widest opacity-60 mb-1">Registration Error</p>
          <p>{error}</p>
        </div>
      )}

      {passwordError && (
        <div className="mb-6 rounded-2xl border border-accent-gold/30 bg-accent-gold/10 px-4 py-3 text-xs font-semibold text-secondary-brown">
          <p className="uppercase tracking-widest opacity-60 mb-1">Validation Alert</p>
          <p>{passwordError}</p>
        </div>
      )}

      <Card className="mb-6">
        <CardBody className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                {t('auth.fullName')} <span className="text-error">*</span>
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ex. Elias Abera"
                required
                fullWidth
                noMargin
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                {t('auth.phone')} <span className="text-error">*</span>
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+251911223344"
                required
                fullWidth
                noMargin
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                {t('auth.email')} (Optional)
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="elias@example.com"
                fullWidth
                noMargin
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-brown">
                Confirm Password <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  fullWidth
                  noMargin
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-brown opacity-40 hover:opacity-100 transition-opacity"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
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
              Initialize Account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-white text-secondary-brown opacity-40">Quick Access</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              theme="outline"
              size="large"
              shape="pill"
              text="signup_with"
              width="100%"
            />
          </div>
        </CardBody>
      </Card>

      <p className="text-center text-sm font-medium text-secondary-brown/70">
        Already have an account?{' '}
        <Link to="/login" className="text-gold hover:text-black transition-colors underline decoration-2 underline-offset-4">
          Sign In
        </Link>
      </p>
      </div>
    </div>
  );
};

export default RegisterPage;