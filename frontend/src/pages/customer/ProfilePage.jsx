import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { fetchMyAppointments } from '../../store/slices/appointmentSlice';
import { updatePhoneNumber } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button/Button';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Input from '../../components/ui/Input/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './ProfilePage.css';

const ProfilePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { appointments, isLoading: appointmentsLoading } = useSelector((state) => state.appointments);
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAppointments());
    
    const params = new URLSearchParams(location.search);
    if (params.get('phoneRequired') === 'true') {
      setShowPhoneModal(true);
    }
  }, [dispatch, location]);

  const validatePhoneNumber = (phone) => {
    const ethiopianPhoneRegex = /^\+251[79]\d{8}$/;
    return ethiopianPhoneRegex.test(phone);
  };

  const handleUpdatePhone = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError(t('auth.invalidPhone'));
      return;
    }

    setUpdatingPhone(true);
    const result = await dispatch(updatePhoneNumber(phoneNumber));
    if (updatePhoneNumber.fulfilled.match(result)) {
      setShowPhoneModal(false);
      setPhoneNumber('');
      setPhoneError('');
    }
    setUpdatingPhone(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING_PAYMENT': return 'gold';
      case 'CHECKED_IN': return 'black';
      case 'IN_PROGRESS': return 'gold';
      case 'COMPLETED': return 'cream';
      case 'CANCELLED': return 'error';
      default: return 'brown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDateParts = (dateString) => {
    const d = new Date(dateString);
    return {
      day: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    };
  };

  if (authLoading) {
    return (
      <div className="container py-20">
        <div className="profile-grid">
          <Skeleton height="400px" variant="rectangle" />
          <Skeleton height="600px" variant="rectangle" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page animate-fade-in">
      <div className="container">
        <div className="mb-12">
          <Badge variant="gold" className="mb-4">Member Profile</Badge>
          <h1 className="text-5xl font-black text-black">Member Dashboard</h1>
        </div>

        <div className="profile-grid">
          {/* Sidebar / User Info */}
          <div className="user-sidebar">
            <Card variant="gold-border" className="overflow-visible">
              <CardBody className="p-8">
                <div className="profile-avatar-container">
                  <div className="profile-avatar">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-black mb-1">{user?.fullName}</h2>
                  <Badge variant="brown" size="sm" className="uppercase tracking-widest">{user?.role}</Badge>
                </div>

                <div className="space-y-2 mb-8">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Phone</span>
                    <span className="profile-info-value">{user?.phoneNumber}</span>
                  </div>
                  {user?.email && (
                    <div className="profile-info-item">
                      <span className="profile-info-label">Email</span>
                      <span className="profile-info-value">{user.email}</span>
                    </div>
                  )}
                  <div className="profile-info-item">
                    <span className="profile-info-label">Joined</span>
                    <span className="profile-info-value">{formatDate(user?.createdAt)}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  fullWidth 
                  size="sm"
                  onClick={() => setShowPhoneModal(true)}
                >
                  Edit Information
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Appointment History */}
          <div className="appointment-history-section">
            <Card className="appointment-history-card">
              <CardHeader className="flex justify-between items-center p-8 bg-black text-white rounded-t-xl">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-widest">Appointment Archive</h3>
                  <p className="text-xs text-gold font-bold">Your journey with us</p>
                </div>
                <Badge variant="gold">{appointments.length} Total</Badge>
              </CardHeader>
              
              <CardBody className="p-8">
                {appointmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} height="100px" variant="rectangle" />)}
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="empty-history">
                    <span className="empty-icon">✂️</span>
                    <p className="text-xl font-bold opacity-30 mb-6">No appointments found.</p>
                    <Button variant="gold" onClick={() => window.location.href = '/booking'}>
                      Book Your First Session
                    </Button>
                  </div>
                ) : (
                  <div className="appointment-list">
                    {appointments.map((appointment) => {
                      const { day, month } = getDateParts(appointment.scheduledDate);
                      return (
                        <div key={appointment.id} className="appointment-item">
                          <div className="apt-date-box">
                            <span className="apt-month">{month}</span>
                            <span className="apt-day">{day}</span>
                          </div>
                          
                          <div className="apt-content">
                            <h4 className="apt-title">
                              {appointment.service?.name?.en || 'Premium Service'}
                            </h4>
                            <p className="apt-meta">
                              {appointment.scheduledTime} • {appointment.service?.duration || 30} Minutes
                            </p>
                          </div>
                          
                          <div className="apt-status text-right">
                            <Badge 
                              variant={getStatusVariant(appointment.status)}
                              size="sm"
                              className="mb-2"
                            >
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                            {appointment.queuePosition && (
                              <p className="text-xs font-black text-gold uppercase tracking-tighter">
                                POS #{appointment.queuePosition}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Phone Modal */}
      <Modal isOpen={showPhoneModal} onClose={() => setShowPhoneModal(false)}>
        <ModalHeader>Update Phone Number</ModalHeader>
        <ModalContent>
          <div className="py-4">
            <p className="text-secondary-brown opacity-60 mb-6 font-medium">
              We use your phone number to coordinate appointments and send vital updates about your session.
            </p>
            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setPhoneError('');
              }}
              placeholder="+251911223344"
              error={phoneError}
              helperText="Format: +251 9/7 [8 digits]"
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPhoneModal(false)}>Discard</Button>
          <Button 
            variant="gold" 
            loading={updatingPhone} 
            onClick={handleUpdatePhone}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProfilePage;