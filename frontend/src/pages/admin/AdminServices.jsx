import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchServices } from '../../store/slices/serviceSlice';
import { adminService } from '../../services/api/admin';
import Card, { CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import BottomSheet from '../../components/ui/BottomSheet/BottomSheet';
import FloatingActionButton from '../../components/ui/FloatingActionButton/FloatingActionButton';
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
    <div className="admin-page animate-fade-in pb-24 lg:pb-8 relative min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 lg:mb-10 px-4 lg:px-0">
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">Services</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1 text-sm tracking-widest uppercase">Portfolio Manager</p>
        </div>
        <div className="hidden lg:block">
          <Button
            variant="black"
            onClick={() => { resetForm(); setShowModal(true); }}
            className="group"
          >
            <PlusIcon className="w-5 h-5 mr-2 inline-block group-hover:rotate-90 transition-transform" />
            {t('admin.addService', 'New Service')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-0">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="200px" variant="rectangle" className="rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 px-4 lg:px-0">
          {services.map((service) => (
            <Card
              key={service._id}
              variant={service.isActive ? 'default' : 'outline'}
              className={`rounded-3xl border-2 transition-all relative overflow-hidden ${
                service.isActive ? 'border-transparent hover:border-black/5' : 'border-gray-200 grayscale opacity-60'
              }`}
            >
              <CardBody className="p-5 lg:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    service.isActive ? 'bg-black text-accent-gold' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <ScissorsIcon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.isActive ? 'success' : 'dark'} size="xs">
                      {service.isActive ? 'LIVE' : 'ARCHIVED'}
                    </Badge>
                    <button 
                      onClick={() => openActions(service)}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-black text-black uppercase tracking-tight line-clamp-1">{service.name?.en}</h3>
                  <p className="text-[10px] font-bold text-secondary-brown/50 uppercase tracking-widest mt-0.5">{service.name?.am}</p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/40 mb-1">Time</p>
                    <p className="text-sm font-black text-black">{service.duration} <span className="text-[10px] uppercase text-secondary-brown/60">min</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/40 mb-1">Price</p>
                    <p className="text-xl font-black text-accent-gold">{service.price} <span className="text-[10px] uppercase text-black">birr</span></p>
                  </div>
                </div>
                
                {/* Desktop Quick Actions (hidden on mobile) */}
                <div className="hidden lg:flex gap-2 mt-4">
                  <Button variant="black" size="xs" className="flex-1" onClick={() => handleEdit(service)}>Edit</Button>
                  {service.isActive ? (
                    <Button variant="outline" size="xs" className="text-error border-error/50 hover:bg-error/10" onClick={() => handleDelete(service._id)}>Disable</Button>
                  ) : (
                    <Button variant="outline" size="xs" className="text-success border-success/50 hover:bg-success/10" onClick={() => handleActivate(service._id)}>Activate</Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <FloatingActionButton 
        icon={<PlusIcon className="w-6 h-6" />}
        onClick={() => { resetForm(); setShowModal(true); }}
        label="New Service"
      />

      {/* Action BottomSheet for Mobile */}
      <BottomSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Manage Service"
      >
        {selectedService && (
          <div className="space-y-4 pb-6">
            <div className="bg-background-cream p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-black text-accent-gold rounded-xl flex items-center justify-center">
                <ScissorsIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-black uppercase">{selectedService.name?.en}</h4>
                <p className="text-xs font-bold text-secondary-brown/60">{selectedService.price} ETB • {selectedService.duration} min</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                variant="black" 
                className="w-full justify-start h-14"
                onClick={() => handleEdit(selectedService)}
              >
                <PencilSquareIcon className="w-5 h-5 mr-3" /> Modify Details
              </Button>
              
              {selectedService.isActive ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 text-error border-error hover:bg-error/5"
                  onClick={() => handleDelete(selectedService._id)}
                >
                  <NoSymbolIcon className="w-5 h-5 mr-3" /> Deactivate Service
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 text-success border-success hover:bg-success/5"
                  onClick={() => handleActivate(selectedService._id)}
                >
                  <CheckCircleIcon className="w-5 h-5 mr-3" /> Activate Service
                </Button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
        <ModalHeader>
          <Badge variant="gold" className="mb-2 uppercase tracking-widest text-[10px]">Protocol</Badge>
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">
            {editingService ? 'Edit Service' : 'New Service'}
          </h2>
        </ModalHeader>
        <ModalContent>
          <form className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 ml-1">Name (EN)</label>
                <Input
                  placeholder="e.g. Buzz Cut"
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name', 'en', e.target.value)}
                  noMargin
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 ml-1">Name (AM)</label>
                <Input
                  placeholder="የጸጉር መቆረጥ"
                  value={formData.name.am}
                  onChange={(e) => handleInputChange('name', 'am', e.target.value)}
                  noMargin
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown/60 ml-1">Description (EN)</label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-colors outline-none font-bold text-black text-sm"
                  placeholder="Service description..."
                  rows="2"
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 bg-black rounded-2xl">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Price (ETB)</label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-2xl font-black text-accent-gold outline-none focus:border-accent-gold transition-colors"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', null, e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Duration (Min)</label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-2xl font-black text-white outline-none focus:border-accent-gold transition-colors"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', null, e.target.value)}
                />
              </div>
            </div>
          </form>
        </ModalContent>
        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="black" className="flex-[2]" onClick={handleSubmit}>
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminServices;
