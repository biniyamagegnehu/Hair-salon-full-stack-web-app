const { Server } = require('socket.io');

let io;
let connectedUsers = new Map(); // userId -> socketId

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} authenticated on socket ${socket.id}`);
      }
    });

    // Join queue room
    socket.on('join-queue-room', () => {
      socket.join('queue-room');
      console.log(`Socket ${socket.id} joined queue room`);
    });

    // Leave queue room
    socket.on('leave-queue-room', () => {
      socket.leave('queue-room');
      console.log(`Socket ${socket.id} left queue room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Emit queue update to all connected clients
const emitQueueUpdate = (queueData) => {
  if (io) {
    io.to('queue-room').emit('queue-update', queueData);
  }
};

// Emit notification to specific user
const emitToUser = (userId, event, data) => {
  if (io && connectedUsers.has(userId)) {
    const socketId = connectedUsers.get(userId);
    io.to(socketId).emit(event, data);
  }
};

// Emit appointment status change to specific user
const emitAppointmentUpdate = (userId, appointmentData) => {
  emitToUser(userId, 'appointment-update', appointmentData);
};

// Emit check-in confirmation
const emitCheckInConfirmation = (userId, queuePosition) => {
  emitToUser(userId, 'check-in-confirmed', { queuePosition });
};

module.exports = {
  initializeSocket,
  emitQueueUpdate,
  emitAppointmentUpdate,
  emitCheckInConfirmation
};