const express = require('express');
const cors = require('cors');
const app = express();

// Simple CORS config
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Login successful',
    data: {
      id: 'test-id',
      email: 'admin@xsalon.com',
      role: 'ADMIN'
    }
  });
});

app.listen(5002, () => {
  console.log('Test server running on http://localhost:5002');
});