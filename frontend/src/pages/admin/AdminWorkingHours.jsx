import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchWorkingHours, updateWorkingHours } from '../../store/slices/adminSlice';

const AdminWorkingHours = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { workingHours, isLoading } = useSelector((state) => state.admin);
  const [hours, setHours] = useState([]);

  const days = [
    t('days.sunday', 'Sunday'),
    t('days.monday', 'Monday'),
    t('days.tuesday', 'Tuesday'),
    t('days.wednesday', 'Wednesday'),
    t('days.thursday', 'Thursday'),
    t('days.friday', 'Friday'),
    t('days.saturday', 'Saturday')
  ];

  useEffect(() => {
    dispatch(fetchWorkingHours());
  }, [dispatch]);

  useEffect(() => {
    if (workingHours.length > 0) {
      setHours(workingHours);
    } else {
      setHours(
        days.map((_, index) => ({
          dayOfWeek: index,
          openingTime: index === 0 ? '09:00' : '08:00',
          closingTime: index === 0 ? '17:00' : '20:00',
          isClosed: index === 0
        }))
      );
    }
  }, [workingHours]);

  const handleToggleClosed = (index) => {
    const updated = [...hours];
    updated[index].isClosed = !updated[index].isClosed;
    setHours(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...hours];
    updated[index][field] = value;
    setHours(updated);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateWorkingHours(hours)).unwrap();
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error || t('common.error'));
    }
  };

  const handleReset = () => {
    if (workingHours.length > 0) {
      setHours(workingHours);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('admin.workingHours')}</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {hours.map((day, index) => (
                <div key={day.dayOfWeek} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <span className="font-medium text-gray-700">{days[day.dayOfWeek]}</span>
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={day.isClosed}
                      onChange={() => handleToggleClosed(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{t('admin.closed', 'Closed')}</span>
                  </label>

                  {!day.isClosed && (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={day.openingTime}
                          onChange={(e) => handleTimeChange(index, 'openingTime', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-500">{t('common.to', 'to')}</span>
                        <input
                          type="time"
                          value={day.closingTime}
                          onChange={(e) => handleTimeChange(index, 'closingTime', e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('common.save')}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('common.reset', 'Reset')}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              {t('admin.workingHoursInfo', 'Working hours determine when customers can book appointments. Changes will take effect immediately.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkingHours;