/**
 * Real-time Notification Helper
 * ──────────────────────────────
 * Other backend controllers import this module to push
 * real-time alerts to connected clients via Socket.IO.
 *
 * Usage (from any controller):
 *   const notifier = require('../socket/notifier');
 *   notifier.toUser(userId, 'new_warning', { reason, severity });
 *   notifier.toAll('new_notice', { title, content });
 *
 * Fixed event names (from MASTER.md):
 *   - new_notice
 *   - new_warning
 *   - task_assigned
 *   - account_approved
 *   - new_meeting
 */

let _io = null;

const notifier = {
  /**
   * Initialize with the Socket.IO server instance.
   * Called once from initSocket() in chat.socket.js.
   */
  init(io) {
    _io = io;
  },

  /**
   * Send a notification to a specific user.
   * @param {string} userId - MongoDB ObjectId string of the target user
   * @param {string} event  - Event name (e.g. 'new_warning')
   * @param {object} data   - Payload to send
   */
  toUser(userId, event, data) {
    if (_io) _io.to(`user_${userId}`).emit(event, data);
  },

  /**
   * Broadcast a notification to all connected users.
   * @param {string} event - Event name (e.g. 'new_notice')
   * @param {object} data  - Payload to send
   */
  toAll(event, data) {
    if (_io) _io.emit(event, data);
  },

  /**
   * Returns the current Socket.IO instance (or null).
   * Useful for advanced use-cases in other modules.
   */
  getIO() {
    return _io;
  },
};

module.exports = notifier;
