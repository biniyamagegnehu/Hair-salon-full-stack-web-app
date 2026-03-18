import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchServices } from '../../store/slices/serviceSlice';
import Button from '../../components/ui/Button/Button';
import Card, { CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './ServicesPage.css';

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { services, isLoading, error } = useSelector((state) => state.services);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleBookNow = (serviceId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/booking', { state: { selectedServiceId: serviceId } });
    }
  };

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('haircut')) return '💇‍♂️';
    if (n.includes('beard')) return '🧔';
    if (n.includes('shave')) return '🪒';
    if (n.includes('style') || n.includes('wax')) return '✨';
    return '✂️';
  };

  if (error) {
    return (
      <div className="container py-20 bg-cream min-h-screen">
        <div className="bg-error/10 border border-error/20 p-8 rounded-3xl shadow-xl max-w-2xl mx-auto">
          <div className="flex items-center gap-6">
            <span className="text-4xl">⚠️</span>
            <div>
              <h3 className="text-xl font-black text-black tracking-tight uppercase mb-2">{t('common.error')}</h3>
              <p className="text-secondary-brown font-bold opacity-60 italic">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page animate-fade-in">
      {/* Services Header */}
      <div className="text-center mb-20">
        <Badge variant="gold" size="lg" className="mb-4">Elegance Defined</Badge>
        <h1 className="text-6xl font-black text-black uppercase tracking-tighter italic">
          Master <span className="text-gold">Grooming</span>
        </h1>
        <p className="text-secondary-brown font-bold opacity-40 mt-2">Precision-crafted services for the modern Ethiopian man</p>
      </div>

      <div className="container">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} padding={false} className="border border-border-primary/20">
                <Skeleton height="240px" variant="rectangle" />
                <div className="p-8">
                  <Skeleton width="40%" height="12px" className="mb-4 opacity-20" />
                  <Skeleton width="70%" height="32px" className="mb-6" />
                  <Skeleton width="100%" height="60px" className="mb-8 opacity-40" />
                  <div className="flex justify-between items-center">
                    <Skeleton width="40%" height="40px" />
                    <Skeleton width="25%" height="16px" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service) => (
              <Card key={service._id} variant="interactive" padding={false} className="h-full flex flex-col">
                <div className="service-card-image">
                  {getServiceIcon(service.name.en || '')}
                </div>
                <CardBody className="p-8 flex-grow">
                  <h2 className="text-2xl font-black mb-3">
                    {i18n.language === 'am' ? service.name.am : service.name.en}
                  </h2>
                  <p className="service-description">
                    {i18n.language === 'am' ? service.description?.am : service.description?.en}
                  </p>
                  
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <span className="text-xs uppercase font-bold opacity-50 block mb-1">Investment</span>
                      <span className="service-price">{service.price} ETB</span>
                    </div>
                    <div className="service-duration">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.duration} {t('booking.minutes')}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleBookNow(service._id)}
                    variant="black"
                    fullWidth
                    className="hover:!bg-accent-gold hover:!text-black group"
                  >
                    {t('booking.confirmBooking')}
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;