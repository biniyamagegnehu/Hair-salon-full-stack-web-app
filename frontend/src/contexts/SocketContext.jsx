import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect(user.id);
      setIsConnected(socketService.isConnected());

      socketService.on('connect', () => {
        setIsConnected(true);
      });

      socketService.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  const onQueueUpdate = (callback) => {
    socketService.on('queue-update', callback);
    return () => socketService.off('queue-update', callback);
  };

  const onAppointmentUpdate = (callback) => {
    socketService.on('appointment-update', callback);
    return () => socketService.off('appointment-update', callback);
  };

  const onCheckInConfirmed = (callback) => {
    socketService.on('check-in-confirmed', callback);
    return () => socketService.off('check-in-confirmed', callback);
  };

  const value = {
    isConnected,
    onQueueUpdate,
    onAppointmentUpdate,
    onCheckInConfirmed
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};