const authRouter = require('./authRouter');
const postRouter = require('./postRouter');
const relationshipRouter = require('./relationshipRouter');
const chatRouter = require('./chatRouter');
const userRouter = require('./userRouter');
const authMiddleware = require('../middlewares/authMiddleware');

const routes = (app, io) => {
  app.use('/auth', authMiddleware, authRouter);
  app.use('/posts', authMiddleware, postRouter(io));
  app.use('/relationships', authMiddleware, relationshipRouter(io));
  app.use('/chat', authMiddleware, chatRouter(io));
  app.use('/user', authMiddleware, userRouter(io));
};

module.exports = routes;
