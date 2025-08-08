import { Server } from 'socket.io';
import { createDeck, evaluateHandFrom7 } from '../../server/game/evaluator';
import { makeGameManager } from '../../server/game/gameManager';

let io;
const rooms = {}; // simple in-memory rooms for demo

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io');
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('socket connected', socket.id);

      socket.on('joinRoom', ({ roomId, name, avatar, maxPlayers=9 }) => {
        if (!rooms[roomId]) {
          rooms[roomId] = makeGameManager(roomId, io);
        }
        const room = rooms[roomId];
        const added = room.addPlayer({ id: socket.id, name, avatar, chips: 1000 });
        if (!added) {
          socket.emit('joinError', { message: 'Room full' });
          return;
        }
        socket.join(roomId);
        io.to(roomId).emit('roomState', room.getState());
      });

      socket.on('startGame', ({ roomId }) => {
        const room = rooms[roomId];
        if (!room) return;
        room.start();
        io.to(roomId).emit('roomState', room.getState());
      });

      socket.on('playerAction', ({ roomId, action, amount }) => {
        const room = rooms[roomId];
        if (!room) return;
        room.playerAction(socket.id, action, amount);
        io.to(roomId).emit('roomState', room.getState());
      });

      socket.on('disconnect', () => {
        for (const id in rooms) {
          rooms[id].removePlayer(socket.id);
          io.to(id).emit('roomState', rooms[id].getState());
        }
      });
    });
  }
  res.end();
}
