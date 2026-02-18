import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchQueueStatus } from '../store/slices/queueSlice';

export const useQueueWebSocket = (enabled = true) => {
  const dispatch = useDispatch();
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const connectWebSocket = () => {
      // For now, we'll use polling as fallback
      // In production, you can replace with actual WebSocket URL
      const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:5000';
      
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('WebSocket connected');
          // Subscribe to queue updates
          ws.current.send(JSON.stringify({ type: 'subscribe', channel: 'queue' }));
        };

        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'queue-update') {
            dispatch(fetchQueueStatus());
          }
        };

        ws.current.onclose = () => {
          console.log('WebSocket disconnected, reconnecting...');
          reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        // Fallback to polling
        reconnectTimeout.current = setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [dispatch, enabled]);
};