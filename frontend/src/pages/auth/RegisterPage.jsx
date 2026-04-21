import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { register, googleLogin, clearError } from '../../store/slices/authSlice';
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
      setPasswordError('Please enter a valid Ethiopian phone number (+251XXXXXXXXX)');
      return;
    }

    if (!validatePassword(formData.password)) {
      setPasswordError('Password must be at least 6 characters and contain at least one number');
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
    <>
      {/* LEFT PANEL - Premium Visuals */}
      <div className="hidden lg:flex w-full lg:w-[45%] bg-primary-black relative flex-col justify-between p-12 overflow-hidden text-white rounded-l-[2.5rem]">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[100%] h-[80%] rounded-full bg-gradient-to-bl from-accent-gold/20 to-transparent blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-[100%] h-[60%] rounded-full bg-gradient-to-tr from-secondary-brown/60 to-transparent blur-[100px]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-gold mb-10">Join X Men&apos;s</p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl xl:text-5xl font-black tracking-tighter leading-[1.1] mb-6">
              Step into the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-[#F5D77F]">New Standard.</span>
            </h2>
            <p className="text-sm xl:text-base leading-relaxed text-white/60 max-w-[320px] font-medium">
              Create an exclusive account to keep your preferences perfectly in sync. Join thousands of gentlemen who trust X Men&apos;s.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-3">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all hover:border-accent-gold/30 hover:bg-white/[0.05]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold transition-transform group-hover:scale-110 group-hover:bg-accent-gold/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Faster booking</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-md">One tap</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 backdrop-blur-md transition-all hover:border-accent-gold/30 hover:bg-white/[0.05]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-accent-gold/10 flex items-center justify-center text-accent-gold transition-transform group-hover:scale-110 group-hover:bg-accent-gold/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Profile-aware service</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-md">Tailored</span>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL - Form Container */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-14 bg-white relative overflow-y-auto max-h-full scrollbar-hide">
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-accent-gold via-accent-gold/50 to-transparent lg:hidden"></div>
        
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-[380px] mx-auto py-8">
          <div className="text-center mb-8">
            <Badge variant="gold" className="mb-3">New Engagement</Badge>
            <h2 className="text-[28px] sm:text-[32px] font-black text-primary-black tracking-tight mb-2">
              {t('auth.register')}
            </h2>
            <p className="text-sm font-semibold text-secondary-brown/50">Join the exclusive X Men's circle</p>
          </div>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 shadow-sm shadow-red-100">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <p className="font-bold mb-1 tracking-wide text-xs uppercase text-red-700 opacity-90">Registration Error</p>
                <p className="font-semibold text-sm text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          {passwordError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-4 flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <p className="font-bold mb-1 tracking-wide text-xs uppercase text-secondary-brown opacity-90">Validation Alert</p>
                <p className="font-semibold text-sm text-secondary-brown">{passwordError}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-secondary-brown ml-1">
                {t('auth.fullName')} <span className="text-red-500">*</span>
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ex. Elias Abera"
                required
                fullWidth
                className="shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-secondary-brown ml-1">
                {t('auth.phone')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+251911223344"
                required
                fullWidth
                className="shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-secondary-brown ml-1">
                {t('auth.email')} (Optional)
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="elias@example.com"
                fullWidth
                className="shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-secondary-brown ml-1">
                  Password <span className="text-red-500">*</span>
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
                    className="pr-10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-brown/40 hover:text-accent-gold transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-secondary-brown ml-1">
                  Confirm <span className="text-red-500">*</span>
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
                    className="pr-10 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-brown/40 hover:text-accent-gold transition-colors p-1"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="black"
              isLoading={isLoading}
              fullWidth
              className="mt-6 shadow-lg shadow-black/10 hover:shadow-black/20"
            >
              Initialize Account
            </Button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 bg-white text-secondary-brown/30">Quick Access</span>
            </div>
          </div>

          <div className="flex justify-center flex-col items-center hover:-translate-y-0.5 transition-transform">
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

          <p className="text-center text-[13px] font-semibold text-secondary-brown/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-gold hover:text-primary-black transition-colors underline decoration-2 underline-offset-4 ml-1">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;