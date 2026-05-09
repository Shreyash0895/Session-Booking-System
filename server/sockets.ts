import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export const setupSockets = (io: Server) => {
  ioInstance = io;
  
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const getIo = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
};
