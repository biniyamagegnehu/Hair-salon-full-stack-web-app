require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🧪 Testing MongoDB connection...\n');
  console.log(`Connection string: ${process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);

  try {
    // Try to connect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ SUCCESS: Connected to MongoDB!');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n📚 Collections (${collections.length}):`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ FAILED: Could not connect to MongoDB');
    console.error(`   Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS lookup failed - check your internet connection');
    }
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Authentication failed - check username/password in connection string');
    }
    if (error.message.includes('not whitelisted')) {
      console.error('\n💡 IP not whitelisted - add your IP in MongoDB Atlas');
    }
  }
}

testConnection();