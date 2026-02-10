const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const SalonConfig = require('../models/SalonConfig');
const WorkingHour = require('../models/WorkingHour');
const bcrypt = require('bcryptjs');
const ApiResponse = require('../utils/response');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const yearStart = new Date(today.getFullYear(), 0, 1);

      // Get counts
      const [
        totalCustomers,
        todayAppointments,
        weekAppointments,
        monthAppointments,
        yearAppointments,
        pendingPayments,
        completedToday,
        revenueToday,
        revenueMonth,
        activeServices
      ] = await Promise.all([
        User.countDocuments({ role: 'CUSTOMER' }),
        
        Appointment.countDocuments({
          scheduledDate: { $gte: today, $lt: tomorrow },
          status: { $nin: ['CANCELLED'] }
        }),
        
        Appointment.countDocuments({
          scheduledDate: { $gte: weekStart },
          status: { $nin: ['CANCELLED'] }
        }),
        
        Appointment.countDocuments({
          scheduledDate: { $gte: monthStart },
          status: { $nin: ['CANCELLED'] }
        }),
        
        Appointment.countDocuments({
          scheduledDate: { $gte: yearStart },
          status: { $nin: ['CANCELLED'] }
        }),
        
        Appointment.countDocuments({
          'payment.paymentStatus': 'PENDING'
        }),
        
        Appointment.countDocuments({
          scheduledDate: { $gte: today, $lt: tomorrow },
          status: 'COMPLETED'
        }),
        
        // Revenue today
        Appointment.aggregate([
          {
            $match: {
              scheduledDate: { $gte: today, $lt: tomorrow },
              'payment.paymentStatus': { $in: ['PARTIAL', 'COMPLETED'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$payment.totalAmount' },
              advance: { $sum: '$payment.advanceAmount' }
            }
          }
        ]),
        
        // Revenue this month
        Appointment.aggregate([
          {
            $match: {
              scheduledDate: { $gte: monthStart },
              'payment.paymentStatus': { $in: ['PARTIAL', 'COMPLETED'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$payment.totalAmount' }
            }
          }
        ]),
        
        Service.countDocuments({ isActive: true })
      ]);

      // Format revenue data
      const todayRevenue = revenueToday.length > 0 ? revenueToday[0] : { total: 0, advance: 0 };
      const monthRevenue = monthRevenue.length > 0 ? monthRevenue[0] : { total: 0 };

      res.json(ApiResponse.success('Dashboard statistics retrieved', {
        stats: {
          customers: {
            total: totalCustomers
          },
          appointments: {
            today: todayAppointments,
            thisWeek: weekAppointments,
            thisMonth: monthAppointments,
            thisYear: yearAppointments,
            pendingPayments,
            completedToday
          },
          revenue: {
            today: {
              total: todayRevenue.total || 0,
              advance: todayRevenue.advance || 0,
              remaining: (todayRevenue.total || 0) - (todayRevenue.advance || 0)
            },
            thisMonth: {
              total: monthRevenue.total || 0
            }
          },
          services: {
            active: activeServices
          }
        },
        period: {
          today: today.toISOString().split('T')[0],
          weekStart: weekStart.toISOString().split('T')[0],
          monthStart: monthStart.toISOString().split('T')[0]
        }
      }));

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get appointment analytics
  getAppointmentAnalytics: async (req, res) => {
    try {
      const { period = 'week' } = req.query; // week, month, year
      
      let startDate = new Date();
      let groupFormat = '%Y-%m-%d';
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          groupFormat = '%Y-%m-%d';
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          groupFormat = '%Y-%m-%d';
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          groupFormat = '%Y-%m';
          break;
      }

      // Get appointment counts by date
      const appointmentTrends = await Appointment.aggregate([
        {
          $match: {
            scheduledDate: { $gte: startDate },
            status: { $nin: ['CANCELLED'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: groupFormat, date: '$scheduledDate' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$payment.totalAmount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Get service popularity
      const servicePopularity = await Appointment.aggregate([
        {
          $match: {
            scheduledDate: { $gte: startDate },
            status: { $nin: ['CANCELLED'] }
          }
        },
        {
          $group: {
            _id: '$service',
            count: { $sum: 1 },
            revenue: { $sum: '$payment.totalAmount' }
          }
        },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'serviceDetails'
          }
        },
        {
          $unwind: '$serviceDetails'
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 5
        }
      ]);

      // Get status distribution
      const statusDistribution = await Appointment.aggregate([
        {
          $match: {
            scheduledDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json(ApiResponse.success('Appointment analytics retrieved', {
        period,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        trends: appointmentTrends,
        popularServices: servicePopularity,
        statusDistribution
      }));

    } catch (error) {
      console.error('Get appointment analytics error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get all customers with pagination
  getAllCustomers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (page - 1) * limit;

      // Build search query
      const query = { role: 'CUSTOMER' };
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ];
      }

      // Get customers with appointment count
      const customers = await User.find(query)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get appointment counts for each customer
      const customerIds = customers.map(c => c._id);
      const appointmentCounts = await Appointment.aggregate([
        {
          $match: {
            customer: { $in: customerIds },
            status: { $nin: ['CANCELLED'] }
          }
        },
        {
          $group: {
            _id: '$customer',
            totalAppointments: { $sum: 1 },
            totalSpent: { $sum: '$payment.totalAmount' },
            lastAppointment: { $max: '$scheduledDate' }
          }
        }
      ]);

      // Map counts to customers
      const countMap = appointmentCounts.reduce((map, count) => {
        map[count._id.toString()] = count;
        return map;
      }, {});

      const customersWithStats = customers.map(customer => ({
        ...customer,
        stats: countMap[customer._id.toString()] || {
          totalAppointments: 0,
          totalSpent: 0,
          lastAppointment: null
        }
      }));

      // Get total count
      const total = await User.countDocuments(query);

      res.json(ApiResponse.success('Customers retrieved', {
        customers: customersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        searchQuery: search
      }));

    } catch (error) {
      console.error('Get all customers error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get customer details with appointment history
  getCustomerDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await User.findById(id)
        .select('-password -refreshToken')
        .lean();

      if (!customer || customer.role !== 'CUSTOMER') {
        return res.status(404).json(ApiResponse.error('Customer not found'));
      }

      // Get customer appointments
      const appointments = await Appointment.find({ customer: id })
        .populate('service')
        .sort({ scheduledDate: -1 })
        .limit(20)
        .lean();

      // Get customer statistics
      const stats = await Appointment.aggregate([
        {
          $match: {
            customer: customer._id,
            status: { $nin: ['CANCELLED'] }
          }
        },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            completedAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
            },
            totalSpent: { $sum: '$payment.totalAmount' },
            averageSpent: { $avg: '$payment.totalAmount' }
          }
        }
      ]);

      // Get favorite service
      const favoriteService = await Appointment.aggregate([
        {
          $match: {
            customer: customer._id,
            status: { $nin: ['CANCELLED'] }
          }
        },
        {
          $group: {
            _id: '$service',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 1
        },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: '_id',
            as: 'serviceDetails'
          }
        },
        {
          $unwind: '$serviceDetails'
        }
      ]);

      res.json(ApiResponse.success('Customer details retrieved', {
        customer,
        appointments,
        stats: stats[0] || {
          totalAppointments: 0,
          completedAppointments: 0,
          totalSpent: 0,
          averageSpent: 0
        },
        favoriteService: favoriteService[0]?.serviceDetails || null,
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Get customer details error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Update salon configuration
  updateSalonConfig: async (req, res) => {
    try {
      const updates = req.body;
      
      // Only allow specific fields to be updated
      const allowedUpdates = [
        'salonName.am', 'salonName.en',
        'location.am', 'location.en',
        'description.am', 'description.en',
        'contactPhone', 'contactEmail',
        'advancePaymentPercentage'
      ];

      const updateObj = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.some(allowed => key.startsWith(allowed.split('.')[0]))) {
          if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!updateObj[parent]) updateObj[parent] = {};
            updateObj[parent][child] = updates[key];
          } else {
            updateObj[key] = updates[key];
          }
        }
      });

      // Validate advance payment percentage
      if (updateObj.advancePaymentPercentage !== undefined) {
        const percentage = parseInt(updateObj.advancePaymentPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          return res.status(400).json(
            ApiResponse.error('Advance payment percentage must be between 0 and 100')
          );
        }
      }

      // Update or create config
      const config = await SalonConfig.findOneAndUpdate(
        {},
        { $set: updateObj },
        { new: true, upsert: true }
      );

      res.json(ApiResponse.success('Salon configuration updated', { config }));

    } catch (error) {
      console.error('Update salon config error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get salon configuration
  getSalonConfig: async (req, res) => {
    try {
      const config = await SalonConfig.findOne();
      
      if (!config) {
        // Return default config if none exists
        return res.json(ApiResponse.success('Salon configuration retrieved', {
          config: {
            salonName: { am: 'ኤክስ ወንዶች ፀጉር አሰፋፈር', en: 'X Men\'s Hair Salon' },
            location: { am: 'አዲስ አበባ, ኢትዮጵያ', en: 'Addis Ababa, Ethiopia' },
            description: { am: 'በፀጉር አሰፋፈር ስልጠና የተማሩ የሙያ ባለሙያዎች', en: 'Professional hairstylists with extensive training' },
            contactPhone: '+251911234567',
            contactEmail: 'info@xmenssalon.com',
            advancePaymentPercentage: 50
          }
        }));
      }

      res.json(ApiResponse.success('Salon configuration retrieved', { config }));

    } catch (error) {
      console.error('Get salon config error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Admin changes own password
  changeAdminPassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.user._id;

      const admin = await User.findById(adminId);
      
      if (!admin) {
        return res.status(404).json(ApiResponse.error('Admin user not found'));
      }

      // Verify current password
      const isPasswordValid = await admin.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json(
          ApiResponse.error('Current password is incorrect')
        );
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      // Invalidate refresh token
      admin.refreshToken = null;
      await admin.save();

      res.json(ApiResponse.success('Password changed successfully'));

    } catch (error) {
      console.error('Change admin password error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

module.exports = adminController;