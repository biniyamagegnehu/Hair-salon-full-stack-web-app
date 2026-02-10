const WorkingHour = require('../models/WorkingHour');
const ApiResponse = require('../utils/response');

const workingHoursController = {
  // Get all working hours
  getWorkingHours: async (req, res) => {
    try {
      const workingHours = await WorkingHour.find().sort({ dayOfWeek: 1 }).lean();

      // Ensure all 7 days exist
      const days = Array.from({ length: 7 }, (_, i) => {
        const existingDay = workingHours.find(wh => wh.dayOfWeek === i);
        if (existingDay) return existingDay;
        
        return {
          dayOfWeek: i,
          openingTime: '09:00',
          closingTime: '17:00',
          isClosed: i === 0 // Sunday closed by default
        };
      });

      res.json(ApiResponse.success('Working hours retrieved', { workingHours: days }));

    } catch (error) {
      console.error('Get working hours error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Update working hours
  updateWorkingHours: async (req, res) => {
    try {
      const updates = req.body; // Array of { dayOfWeek, openingTime, closingTime, isClosed }

      if (!Array.isArray(updates)) {
        return res.status(400).json(
          ApiResponse.error('Updates must be an array')
        );
      }

      const updatePromises = updates.map(update => {
        // Validate time format
        if (!update.isClosed) {
          const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(update.openingTime) || !timeRegex.test(update.closingTime)) {
            throw new Error('Invalid time format');
          }

          // Validate opening time is before closing time
          const [openHour, openMinute] = update.openingTime.split(':').map(Number);
          const [closeHour, closeMinute] = update.closingTime.split(':').map(Number);
          
          if (openHour > closeHour || (openHour === closeHour && openMinute >= closeMinute)) {
            throw new Error('Opening time must be before closing time');
          }
        }

        return WorkingHour.findOneAndUpdate(
          { dayOfWeek: update.dayOfWeek },
          {
            openingTime: update.openingTime,
            closingTime: update.closingTime,
            isClosed: update.isClosed
          },
          { upsert: true, new: true }
        );
      });

      const updatedHours = await Promise.all(updatePromises);

      res.json(ApiResponse.success('Working hours updated', { workingHours: updatedHours }));

    } catch (error) {
      console.error('Update working hours error:', error);
      if (error.message.includes('Invalid time format')) {
        return res.status(400).json(
          ApiResponse.error('Time must be in HH:MM format (24-hour)')
        );
      }
      if (error.message.includes('Opening time must be before closing time')) {
        return res.status(400).json(
          ApiResponse.error('Opening time must be before closing time')
        );
      }
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get today's working hours
  getTodayWorkingHours: async (req, res) => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      const workingHour = await WorkingHour.findOne({ dayOfWeek });

      if (!workingHour) {
        return res.json(ApiResponse.success('Today\'s working hours', {
          today: {
            dayOfWeek,
            dayName: getDayName(dayOfWeek),
            openingTime: '09:00',
            closingTime: '17:00',
            isClosed: dayOfWeek === 0
          }
        }));
      }

      res.json(ApiResponse.success('Today\'s working hours', {
        today: {
          ...workingHour.toObject(),
          dayName: getDayName(dayOfWeek)
        }
      }));

    } catch (error) {
      console.error('Get today working hours error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Get next available working day
  getNextAvailableDay: async (req, res) => {
    try {
      const today = new Date();
      const daysToCheck = 14; // Check next 14 days

      const workingHours = await WorkingHour.find().lean();
      const workingHoursMap = workingHours.reduce((map, wh) => {
        map[wh.dayOfWeek] = wh;
        return map;
      }, {});

      let nextAvailableDay = null;
      
      for (let i = 1; i <= daysToCheck; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        
        const workingHour = workingHoursMap[dayOfWeek] || {
          dayOfWeek,
          isClosed: dayOfWeek === 0,
          openingTime: '09:00',
          closingTime: '17:00'
        };

        if (!workingHour.isClosed) {
          nextAvailableDay = {
            date: checkDate.toISOString().split('T')[0],
            dayOfWeek,
            dayName: getDayName(dayOfWeek),
            openingTime: workingHour.openingTime,
            closingTime: workingHour.closingTime
          };
          break;
        }
      }

      res.json(ApiResponse.success('Next available day retrieved', { nextAvailableDay }));

    } catch (error) {
      console.error('Get next available day error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

// Helper function to get day name
function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

module.exports = workingHoursController;