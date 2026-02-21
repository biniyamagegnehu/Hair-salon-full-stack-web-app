import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminAppointments = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('admin.appointments')}</h2>
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500">{t('common.comingSoon', 'Appointment management coming soon...')}</p>
      </div>
    </div>
  );
};

export default AdminAppointments;