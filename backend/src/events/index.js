const cookie = require('cookie');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const postEvents = require('./postEvents');
const friendEvents = require('./friendEvents');
const chatEvents = require('./chatEvents');

const events = async (io, client) => {
  io.on('connection', async (socket) => {
    const cookies = socket.handshake.headers.cookie;

    if (cookies) {
      const { refreshToken } = cookie.parse(cookies);

      if (refreshToken) {
        try {
          const userToken = jwt.verify(refreshToken, process.env.JWT_SECRET);

          socket.join(`user-${userToken.id}`);

          socket.on('disconnect', async () => {
            socket.leave(`user-${userToken.id}`);
          });

          postEvents(socket);
          friendEvents(socket, io, client, userToken);
          chatEvents(socket, io);
        } catch (error) {
          socket.disconnect();
        }
      } else {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
  });
};

module.exports = events;
