import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef<Record<string, (...args: any[]) => void>>({});

  useEffect(() => {
    // Determine the socket URL from the environment or use development default
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketId(socket.id || null);
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

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove previous listener for this event if exists
    if (listenersRef.current[event]) {
      socket.off(event, listenersRef.current[event]);
    }

    socket.on(event, handler);
    listenersRef.current[event] = handler;
  }, []);

  const off = useCallback((event: string) => {
    const socket = socketRef.current;
    if (!socket) return;

    if (listenersRef.current[event]) {
      socket.off(event, listenersRef.current[event]);
      delete listenersRef.current[event];
    }
  }, []);

  return { socket: socketRef.current, socketId, isConnected, on, off };
}
