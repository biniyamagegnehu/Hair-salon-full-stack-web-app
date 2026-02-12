const mongoose = require('mongoose');
const app = require('./app');
const { initCronJobs } = require('./services/cronJobs');

const PORT = process.env.PORT || 5000;

// Connect to database with better error handling
const connectDB = async () => {
  try {
    console.log('📦 Connecting to MongoDB...');
    
    // Remove deprecated options - they are no longer needed in Mongoose 7+
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected successfully');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Initialize cron jobs after DB connection
    initCronJobs();
    console.log('⏰ Cron jobs initialized');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if your IP is whitelisted in MongoDB Atlas');
    console.log('2. Verify your connection string in .env file');
    console.log('3. Make sure your network allows MongoDB connections');
    console.log('4. Try using local MongoDB: mongodb://localhost:27017/x_mens_hair_salon\n');
    process.exit(1);
  }
};

// Start server only after DB connection
const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🔄 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API base: http://localhost:${PORT}/api\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log('💥 UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.log('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully');
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log('💤 Process terminated');
        process.exit(0);
      });
    });
  });
};

startServer();