import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchServices } from '../../store/slices/serviceSlice';
import { adminService } from '../../services/api/admin';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import {
  ScissorsIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AdminServices = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { services, isLoading } = useSelector((state) => state.services);
  
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const [formData, setFormData] = useState({
    name: { am: '', en: '' },
    description: { am: '', en: '' },
    price: '',
    duration: ''
  });

  useEffect(() => {
    dispatch(fetchServices(false));
  }, [dispatch]);

  const handleInputChange = (field, lang, value) => {
    if (field === 'name' || field === 'description') {
      setFormData({
        ...formData,
        [field]: { ...formData[field], [lang]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingService) {
        await adminService.updateService(editingService._id, formData);
        toast.success(t('common.success'));
      } else {
        await adminService.createService(formData);
        toast.success(t('common.success'));
      }
      dispatch(fetchServices(false));
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.confirmDeactivate', 'Are you sure you want to deactivate this service?'))) {
      try {
        await adminService.deleteService(id);
        toast.success(t('common.success'));
        dispatch(fetchServices(false));
        setShowActionSheet(false);
      } catch (error) {
        toast.error(error.response?.data?.message || t('common.error'));
      }
    }
  };

  const handleActivate = async (id) => {
    try {
      await adminService.activateService(id);
      toast.success(t('common.success'));
      dispatch(fetchServices(false));
      setShowActionSheet(false);
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (service) => {
    setShowActionSheet(false);
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || { am: '', en: '' },
      price: service.price,
      duration: service.duration
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: { am: '', en: '' },
      description: { am: '', en: '' },
      price: '',
      duration: ''
    });
  };

  const openActions = (service) => {
    setSelectedService(service);
    setShowActionSheet(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-8 relative min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 lg:mb-10 px-4 lg:px-0">
        <div>
          <span className="inline-flex px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Portfolio Manager</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-50 tracking-tight">Services</h1>
        </div>
        <div className="hidden lg:block">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 h-[44px] bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-bold transition-all active:scale-95 shadow-sm group"
          >
            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t('admin.addService', 'New Service')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-0">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[200px] bg-zinc-900 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-0">
          {services.map((service) => (
            <div
              key={service._id}
              className={`rounded-3xl border transition-all relative overflow-hidden bg-zinc-900 p-5 lg:p-6 ${
                service.isActive ? 'border-zinc-800 hover:border-zinc-700 shadow-sm' : 'border-zinc-800/50 grayscale opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  service.isActive ? 'bg-zinc-950 border-zinc-800 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                }`}>
                  <ScissorsIcon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                    service.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                  }`}>
                    {service.isActive ? 'LIVE' : 'ARCHIVED'}
                  </span>
                  <button 
                    onClick={() => openActions(service)}
                    className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-zinc-100 uppercase tracking-tight line-clamp-1">{service.name?.en}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{service.name?.am}</p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/50">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Time</p>
                  <p className="text-sm font-bold text-zinc-100">{service.duration} <span className="text-[10px] uppercase text-zinc-600">min</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Price</p>
                  <p className="text-xl font-bold text-amber-500">{service.price} <span className="text-[10px] uppercase text-zinc-400">birr</span></p>
                </div>
              </div>
              
              {/* Desktop Quick Actions (hidden on mobile) */}
              <div className="hidden lg:flex gap-2 mt-4">
                <button 
                  className="flex-1 h-8 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-bold hover:bg-white transition-colors"
                  onClick={() => handleEdit(service)}
                >
                  Edit
                </button>
                {service.isActive ? (
                  <button 
                    className="flex-1 h-8 bg-transparent border border-red-500/50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-colors"
                    onClick={() => handleDelete(service._id)}
                  >
                    Disable
                  </button>
                ) : (
                  <button 
                    className="flex-1 h-8 bg-transparent border border-emerald-500/50 text-emerald-500 rounded-lg text-xs font-bold hover:bg-emerald-500/10 transition-colors"
                    onClick={() => handleActivate(service._id)}
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button 
        onClick={() => { resetForm(); setShowModal(true); }}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-amber-500 text-zinc-950 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:bg-amber-400 active:scale-95 transition-all z-40"
        aria-label="New Service"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Action BottomSheet for Mobile */}
      {showActionSheet && selectedService && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 lg:hidden">
          <div className="w-full bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-md p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-widest">Manage Service</h3>
              <button onClick={() => setShowActionSheet(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <div className="space-y-4 pb-2">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 text-amber-500 rounded-xl flex items-center justify-center">
                  <ScissorsIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100 uppercase">{selectedService.name?.en}</h4>
                  <p className="text-xs font-bold text-zinc-500">{selectedService.price} ETB • {selectedService.duration} min</p>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  className="w-full h-14 flex items-center px-4 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-white transition-colors"
                  onClick={() => handleEdit(selectedService)}
                >
                  <PencilSquareIcon className="w-5 h-5 mr-3" /> Modify Details
                </button>
                
                {selectedService.isActive ? (
                  <button 
                    className="w-full h-14 flex items-center px-4 bg-transparent border border-red-500/50 text-red-500 rounded-xl font-bold hover:bg-red-500/10 transition-colors"
                    onClick={() => handleDelete(selectedService._id)}
                  >
                    <NoSymbolIcon className="w-5 h-5 mr-3" /> Deactivate Service
                  </button>
                ) : (
                  <button 
                    className="w-full h-14 flex items-center px-4 bg-transparent border border-emerald-500/50 text-emerald-500 rounded-xl font-bold hover:bg-emerald-500/10 transition-colors"
                    onClick={() => handleActivate(selectedService._id)}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-3" /> Activate Service
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center sticky top-0 bg-zinc-950/90 backdrop-blur-md z-10">
              <div>
                <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-widest mb-1">Protocol</span>
                <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">
                  {editingService ? 'Edit Service' : 'New Service'}
                </h2>
              </div>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            
            <div className="p-6 flex-1">
              <form className="space-y-6 py-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Name (EN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Buzz Cut"
                      value={formData.name.en}
                      onChange={(e) => handleInputChange('name', 'en', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Name (AM)</label>
                    <input
                      type="text"
                      placeholder="የጸጉር መቆረጥ"
                      value={formData.name.am}
                      onChange={(e) => handleInputChange('name', 'am', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none placeholder:text-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Description (EN)</label>
                    <textarea
                      className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-amber-500 transition-colors outline-none font-bold text-zinc-100 text-sm placeholder:text-zinc-600"
                      placeholder="Service description..."
                      rows="2"
                      value={formData.description.en}
                      onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price (ETB)</label>
                    <input
                      type="number"
                      className="w-full bg-transparent border-b border-zinc-700 py-2 text-2xl font-bold text-amber-500 outline-none focus:border-amber-500 transition-colors"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', null, e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Duration (Min)</label>
                    <input
                      type="number"
                      className="w-full bg-transparent border-b border-zinc-700 py-2 text-2xl font-bold text-zinc-100 outline-none focus:border-amber-500 transition-colors"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', null, e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-950 sticky bottom-0 z-10">
              <button 
                className="px-6 py-3 bg-transparent border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-colors w-full sm:w-auto"
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                Cancel
              </button>
              <button 
                className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-white transition-colors w-full sm:w-auto"
                onClick={handleSubmit}
              >
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
