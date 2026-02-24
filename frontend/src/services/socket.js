import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      
      // Authenticate with userId
      if (userId) {
        this.socket.emit('authenticate', userId);
      }
      
      // Join queue room
      this.socket.emit('join-queue-room');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up default event handlers
    this.setupDefaultListeners();
  }

  setupDefaultListeners() {
    // Queue updates
    this.socket.on('queue-update', (data) => {
      this.emit('queue-update', data);
    });

    // Appointment updates
    this.socket.on('appointment-update', (data) => {
      this.emit('appointment-update', data);
    });

    // Check-in confirmation
    this.socket.on('check-in-confirmed', (data) => {
      this.emit('check-in-confirmed', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('leave-queue-room');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();