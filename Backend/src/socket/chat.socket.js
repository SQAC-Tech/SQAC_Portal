const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const notifier = require('./notifier');

/**
 * Initialize Socket.IO on the given HTTP server.
 * CRITICAL: Returns the io instance — required by server.js.
 *
 * @param {import('http').Server} server - Node HTTP server
 * @returns {import('socket.io').Server} io instance
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Wire up the notifier so other controllers can push events
  notifier.init(io);

  /* ── Auth middleware: verify JWT from handshake ── */
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Not authenticated'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  /* ── Connection handler ── */
  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.username || socket.user.userId);

    // Join group chat room
    socket.join('group_chat');

    // Join personal room for direct messages & notifications
    socket.join(`user_${socket.user.userId}`);

    /* ── Group message ── */
    socket.on('group_message', async (data) => {
      try {
        const message = await Message.create({
          sender: socket.user.userId,
          content: data.content,
          chatType: 'group',
        });
        await message.populate('sender', 'name username profilePic');
        io.to('group_chat').emit('new_group_message', message);
      } catch (err) {
        console.error('group_message error:', err.message);
        socket.emit('error_message', { error: 'Failed to send group message' });
      }
    });

    /* ── Direct message ── */
    socket.on('direct_message', async (data) => {
      try {
        const message = await Message.create({
          sender: socket.user.userId,
          receiver: data.receiverId,
          content: data.content,
          chatType: 'direct',
        });
        await message.populate('sender', 'name username profilePic');

        // Emit to sender and receiver only
        socket.emit('new_direct_message', message);
        io.to(`user_${data.receiverId}`).emit('new_direct_message', message);
      } catch (err) {
        console.error('direct_message error:', err.message);
        socket.emit('error_message', { error: 'Failed to send direct message' });
      }
    });

    /* ── Mark messages as read ── */
    socket.on('mark_read', async (data) => {
      try {
        await Message.updateMany(
          { _id: { $in: data.messageIds } },
          { $addToSet: { readBy: socket.user.userId } }
        );
        socket.emit('messages_marked_read', { messageIds: data.messageIds });
      } catch (err) {
        console.error('mark_read error:', err.message);
      }
    });

    /* ── Typing indicators ── */
    socket.on('typing', (data) => {
      if (data.chatType === 'group') {
        socket.to('group_chat').emit('user_typing', {
          userId: socket.user.userId,
          username: socket.user.username,
          chatType: 'group',
        });
      } else if (data.receiverId) {
        io.to(`user_${data.receiverId}`).emit('user_typing', {
          userId: socket.user.userId,
          username: socket.user.username,
          chatType: 'direct',
        });
      }
    });

    socket.on('stop_typing', (data) => {
      if (data.chatType === 'group') {
        socket.to('group_chat').emit('user_stop_typing', {
          userId: socket.user.userId,
        });
      } else if (data.receiverId) {
        io.to(`user_${data.receiverId}`).emit('user_stop_typing', {
          userId: socket.user.userId,
        });
      }
    });

    /* ── Disconnect ── */
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.username || socket.user.userId);
    });
  });

  // CRITICAL: return io so server.js can use it
  return io;
}

module.exports = initSocket;
