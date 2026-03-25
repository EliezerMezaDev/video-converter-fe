import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef({});

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketId(socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const on = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove previous listener for this event if exists
    if (listenersRef.current[event]) {
      socket.off(event, listenersRef.current[event]);
    }

    socket.on(event, handler);
    listenersRef.current[event] = handler;
  }, []);

  const off = useCallback((event) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (listenersRef.current[event]) {
      socket.off(event, listenersRef.current[event]);
      delete listenersRef.current[event];
    }
  }, []);

  return { socket: socketRef.current, socketId, isConnected, on, off };
}
