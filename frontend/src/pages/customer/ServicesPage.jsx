import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { fetchServices } from '../../store/slices/serviceSlice';
import Skeleton from '../../components/ui/Skeleton/Skeleton';

const blackButton = 'bg-[#0F0F0F] text-white px-6 py-3 rounded-lg hover:bg-[#2A2A2A] transition-all duration-300 font-medium shadow-md hover:shadow-lg';
const outlineButton = 'border-2 border-[#C9A227] text-[#C9A227] px-6 py-3 rounded-lg hover:bg-[#C9A227] hover:text-[#0F0F0F] transition-all duration-300';

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { services, isLoading, error } = useSelector((state) => state.services);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const handleBookNow = (serviceId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate('/booking', { state: { selectedServiceId: serviceId } });
  };

  const getServiceAccent = (index) => {
    const accents = [
      'bg-[#0F0F0F] text-[#C9A227]',
      'bg-[#F8F4EC] text-[#0F0F0F]',
      'bg-[#3B2F2F] text-white'
    ];

    return accents[index % accents.length];
  };

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl rounded-[32px] border border-red-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-red-500">Unable to load services</p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#0F0F0F]">{t('common.error')}</h1>
          <p className="mt-4 text-base leading-7 text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 lg:space-y-12">
      <section className="rounded-[32px] border border-black/5 bg-white px-6 py-10 shadow-sm sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-[#C9A227] px-3 py-1 text-sm font-medium text-[#0F0F0F]">Service menu</span>
            <h1 className="mt-4 text-4xl font-bold tracking-[-0.05em] text-[#0F0F0F] sm:text-5xl">
              Clean service selection with clear timing, pricing, and next steps.
            </h1>
            <p className="mt-4 text-base leading-8 text-gray-700">
              Explore each grooming service with transparent duration and pricing, then jump straight into booking when you are ready.
            </p>
          </div>

          <button type="button" onClick={() => navigate('/booking')} className={outlineButton}>
            Start booking
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <Skeleton height="56px" variant="rectangle" className="rounded-2xl" />
              <Skeleton height="30px" className="mt-6 w-2/3" />
              <Skeleton height="90px" className="mt-4" />
              <Skeleton height="20px" className="mt-6 w-1/3" />
              <Skeleton height="44px" variant="rectangle" className="mt-6 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const title = i18n.language === 'am' ? service.name?.am : service.name?.en;
            const description = i18n.language === 'am' ? service.description?.am : service.description?.en;

            return (
              <article key={service._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold ${getServiceAccent(index)}`}>
                    {title?.charAt(0) || 'S'}
                  </div>
                  <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-sm font-medium text-[#3B2F2F]">
                    {service.price} ETB
                  </span>
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[#0F0F0F]">{title}</h2>
                <p className="mt-4 flex-1 text-base leading-7 text-gray-700">{description}</p>

                <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#F8F4EC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#3B2F2F]">
                    <ClockIcon className="h-4 w-4 text-[#C9A227]" />
                    {service.duration} {t('booking.minutes')}
                  </div>
                  <span className="text-sm font-medium text-[#0F0F0F]">Professional finish</span>
                </div>

                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => handleBookNow(service._id)} className={`${blackButton} flex-1`}>
                    {t('booking.confirmBooking')}
                  </button>
                  <button type="button" onClick={() => navigate('/queue')} className="flex h-[50px] w-[50px] items-center justify-center rounded-lg border border-gray-200 bg-white text-[#0F0F0F] transition-colors hover:border-[#C9A227] hover:text-[#C9A227]">
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
