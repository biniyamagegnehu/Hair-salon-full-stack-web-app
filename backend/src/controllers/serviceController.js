const Service = require('../models/Service');
const ApiResponse = require('../utils/response');

const serviceController = {
  // Create new service
  createService: async (req, res) => {
    try {
      const { name, description, price, duration } = req.body;

      // Validate required fields
      if (!name?.am || !name?.en) {
        return res.status(400).json(
          ApiResponse.error('Service name is required in both Amharic and English')
        );
      }

      if (!price || price < 0) {
        return res.status(400).json(
          ApiResponse.error('Valid price is required')
        );
      }

      if (!duration || duration < 5) {
        return res.status(400).json(
          ApiResponse.error('Duration must be at least 5 minutes')
        );
      }

      // Check if service with same name already exists
      const existingService = await Service.findOne({
        $or: [
          { 'name.am': name.am },
          { 'name.en': name.en }
        ]
      });

      if (existingService) {
        return res.status(400).json(
          ApiResponse.error('Service with this name already exists')
        );
      }

      // Create service
      const service = await Service.create({
        name,
        description: description || { am: '', en: '' },
        price,
        duration,
        isActive: true
      });

      res.status(201).json(ApiResponse.created('Service created successfully', { service }));

    } catch (error) {
      console.error('Create service error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get all services (public)
  getAllServices: async (req, res) => {
    try {
      const { activeOnly = 'true' } = req.query;
      
      const query = activeOnly === 'true' ? { isActive: true } : {};
      
      const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .lean();

      res.json(ApiResponse.success('Services retrieved', { services }));

    } catch (error) {
      console.error('Get all services error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get service by ID
  getServiceById: async (req, res) => {
    try {
      const { id } = req.params;

      const service = await Service.findById(id).lean();

      if (!service) {
        return res.status(404).json(ApiResponse.error('Service not found'));
      }

      res.json(ApiResponse.success('Service retrieved', { service }));

    } catch (error) {
      console.error('Get service by ID error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Update service
  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate price if provided
      if (updates.price !== undefined && updates.price < 0) {
        return res.status(400).json(
          ApiResponse.error('Price cannot be negative')
        );
      }

      // Validate duration if provided
      if (updates.duration !== undefined && updates.duration < 5) {
        return res.status(400).json(
          ApiResponse.error('Duration must be at least 5 minutes')
        );
      }

      // Check for duplicate name
      if (updates.name) {
        const existingService = await Service.findOne({
          _id: { $ne: id },
          $or: [
            { 'name.am': updates.name.am },
            { 'name.en': updates.name.en }
          ]
        });

        if (existingService) {
          return res.status(400).json(
            ApiResponse.error('Service with this name already exists')
          );
        }
      }

      const service = await Service.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!service) {
        return res.status(404).json(ApiResponse.error('Service not found'));
      }

      res.json(ApiResponse.success('Service updated successfully', { service }));

    } catch (error) {
      console.error('Update service error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Delete/Deactivate service
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      const { permanent = 'false' } = req.query;

      if (permanent === 'true') {
        // Check if service has appointments
        const Appointment = require('../models/Appointment');
        const hasAppointments = await Appointment.exists({ service: id });

        if (hasAppointments) {
          return res.status(400).json(
            ApiResponse.error('Cannot delete service with existing appointments. Deactivate instead.')
          );
        }

        // Permanent delete
        await Service.findByIdAndDelete(id);
        return res.json(ApiResponse.success('Service deleted permanently'));
      } else {
        // Soft delete (deactivate)
        const service = await Service.findByIdAndUpdate(
          id,
          { isActive: false },
          { new: true }
        );

        if (!service) {
          return res.status(404).json(ApiResponse.error('Service not found'));
        }

        res.json(ApiResponse.success('Service deactivated', { service }));
      }

    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Activate service
  activateService: async (req, res) => {
    try {
      const { id } = req.params;

      const service = await Service.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
      );

      if (!service) {
        return res.status(404).json(ApiResponse.error('Service not found'));
      }

      res.json(ApiResponse.success('Service activated', { service }));

    } catch (error) {
      console.error('Activate service error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

module.exports = serviceController;