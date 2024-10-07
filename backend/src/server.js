require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const http = require('http');
const { AppDataSource } = require('./data-source');
const routes = require('./routes');
const { errorHandler } = require('./utils/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware');
const events = require('./events');
require('events').EventEmitter.prototype._maxListeners = 100;
const { createClient } = require('redis');
require('express-async-errors');
const path = require('path');

AppDataSource.initialize()
  .then(async () => {
    const port = process.env.PORT || 8080;
    const app = express();

    app.use(express.json());
    app.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      })
    );
    app.use(cookieParser());

    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    });

    const client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('connect', async () => {
      console.log('Redis client connected successfully');
    });

    client.on('error', (err) => {
      console.error('Redis client connection error:', err);
    });

    try {
      await client.connect();
    } catch (error) {
      console.error('Redis client connection failed', error);
    }

    // app.use(authMiddleware);

    events(io, client);
    routes(app, io);

    app.use(errorHandler);

    if (process.env.BUILD_MODE === 'production') {
      const __dirname = path.resolve();

      app.use(express.static(path.join(__dirname, '/frontend/dist')));

      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
      });
    }

    server.listen(port, () => {
      console.log('Server running on port ' + port);
    });
  })
  .catch((error) => console.log(error));
