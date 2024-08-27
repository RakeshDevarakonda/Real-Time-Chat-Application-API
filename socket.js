
export const setupSocket = (io) => {

    io.on('connection', (socket) => {
      console.log('New WebSocket connection:', socket.id);
  
      socket.on('sendMessage', (message) => {
        console.log(message)
        io.emit('message', message);
      });
  
      socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
      });
    });
  };
  