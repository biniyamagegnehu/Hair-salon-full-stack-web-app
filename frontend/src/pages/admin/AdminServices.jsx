import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { fetchServices } from '../../store/slices/serviceSlice';
import { adminService } from '../../services/api/admin';
import Card, { CardHeader, CardBody } from '../../components/ui/Card/Card';
import Badge from '../../components/ui/Badge/Badge';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '../../components/ui/Modal/Modal';
import Skeleton from '../../components/ui/Skeleton/Skeleton';
import './AdminPages.css';

const AdminServices = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { services, isLoading } = useSelector((state) => state.services);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
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
        [field]: {
          ...formData[field],
          [lang]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
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
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleEdit = (service) => {
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

  return (
    <div className="admin-page animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <Badge variant="gold" className="mb-4">Service Catalog</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">Portfolio Manager</h1>
          <p className="text-secondary-brown font-bold opacity-40 mt-1 text-sm sm:text-base">Curate your professional offerings and pricing structure</p>
        </div>
        <Button
          variant="black"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="group w-full md:w-auto"
        >
          <span className="mr-2 group-hover:rotate-90 transition-transform inline-block">+</span>
          {t('admin.addService', 'Register New Service')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="320px" variant="rectangle" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service) => (
            <Card
              key={service._id}
              variant={service.isActive ? 'default' : 'outline'}
              className={`group hover:-translate-y-2 transition-all duration-500 overflow-hidden relative ${
                !service.isActive ? 'grayscale opacity-70' : ''
              }`}
            >
              <div className="absolute top-0 right-0 p-4">
                <Badge variant={service.isActive ? 'success' : 'dark'} size="xs">
                  {service.isActive ? 'LIVE' : 'ARCHIVED'}
                </Badge>
              </div>

              <CardBody className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-black uppercase tracking-tighter leading-none group-hover:text-gold transition-colors">{service.name?.en}</h3>
                  <p className="text-sm font-bold text-secondary-brown opacity-40 uppercase tracking-widest mt-1">{service.name?.am}</p>
                </div>

                <div className="bg-background-cream/50 p-4 rounded-xl border border-border-primary mb-6 min-h-[80px]">
                  <p className="text-xs font-bold text-secondary-brown leading-relaxed line-clamp-3 italic">
                    {service.description?.en || 'Tactical grooming solution tailored for elite clientele.'}
                  </p>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] font-black text-secondary-brown opacity-40 uppercase tracking-widest leading-none mb-1">Valuation</p>
                    <p className="text-3xl font-black text-black leading-none">{service.price} <span className="text-xs text-gold">ETB</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-secondary-brown opacity-40 uppercase tracking-widest leading-none mb-1">Time Block</p>
                    <p className="text-xl font-bold text-black leading-none">{service.duration} <span className="text-[10px] uppercase">min</span></p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="black"
                    size="sm"
                    className="flex-1 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => handleEdit(service)}
                  >
                    Modify
                  </Button>
                  {service.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-[10px] font-black uppercase tracking-widest border-error/20 text-error hover:bg-error/5"
                      onClick={() => handleDelete(service._id)}
                    >
                      Disable
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1 text-[10px] font-black uppercase tracking-widest"
                      onClick={() => handleActivate(service._id)}
                    >
                      Authorize
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Service Configuration Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }}>
        <ModalHeader>
          <Badge variant="gold" className="mb-2">Operational Protocol</Badge>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">
            {editingService ? 'Modify Service' : 'Initialize Service'}
          </h2>
        </ModalHeader>
        <ModalContent>
          <form className="space-y-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown">Label (International)</label>
                <Input
                  placeholder="e.g. EXECUTIVE CROP"
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name', 'en', e.target.value)}
                  noMargin
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown">Label (Amharic)</label>
                <Input
                  placeholder="የጸጉር መቆረጥ"
                  value={formData.name.am}
                  onChange={(e) => handleInputChange('name', 'am', e.target.value)}
                  noMargin
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown">Manifesto (EN)</label>
                <textarea
                  className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl focus:border-accent-gold transition-colors outline-none font-bold text-black text-sm min-h-[100px]"
                  placeholder="Service specifications..."
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description', 'en', e.target.value)}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary-brown">Manifesto (AM)</label>
                <textarea
                  className="w-full px-4 py-3 bg-cream/30 border border-border-primary rounded-xl focus:border-accent-gold transition-colors outline-none font-bold text-black text-sm min-h-[100px]"
                  placeholder="የአገልግሎት ዝርዝር..."
                  value={formData.description.am}
                  onChange={(e) => handleInputChange('description', 'am', e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6 bg-black rounded-2xl">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Market Value (ETB)</label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-2xl font-black text-gold outline-none focus:border-gold transition-colors"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', null, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Execution Time (Min)</label>
                <input
                  type="number"
                  className="w-full bg-transparent border-b border-white/20 py-2 text-2xl font-black text-white outline-none focus:border-gold transition-colors"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', null, e.target.value)}
                />
              </div>
            </div>
          </form>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
            Abort
          </Button>
          <Button variant="gold" onClick={handleSubmit}>
            {editingService ? 'Commit Changes' : 'Propagate Service'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AdminServices;