const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/response');

// Public test endpoint
router.get('/', (req, res) => {
  res.json(ApiResponse.success('Test route is working!'));
});

router.get('/ping', (req, res) => {
  res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

module.exports = router;