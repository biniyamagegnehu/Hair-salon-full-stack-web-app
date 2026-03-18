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
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <Badge variant="gold" className="mb-4">New Engagement</Badge>
        <h2 className="text-4xl font-black text-black uppercase tracking-tight">
          {t('auth.register')}
        </h2>
        <p className="text-secondary-brown font-bold opacity-40 mt-1 italic">Join the exclusive X Men's circle</p>
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl font-bold text-xs mb-8">
          <p className="uppercase tracking-widest opacity-60 mb-1">Registration Error</p>
          <p>{error}</p>
        </div>
      )}

      {passwordError && (
        <div className="bg-gold/10 border border-gold/20 text-gold px-6 py-4 rounded-2xl font-bold text-xs mb-8">
          <p className="uppercase tracking-widest opacity-60 mb-1">Validation Alert</p>
          <p>{passwordError}</p>
        </div>
      )}

      <Card className="mb-8">
        <CardBody className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown italic">
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

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary"></div>
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

      <p className="text-center text-sm font-bold text-secondary-brown opacity-60">
        Already have an account?{' '}
        <Link to="/login" className="text-gold hover:text-black transition-colors underline decoration-2 underline-offset-4">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;