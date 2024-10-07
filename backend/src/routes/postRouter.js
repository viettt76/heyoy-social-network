const express = require('express');
const postController = require('../controllers/PostController');
const ioMiddleware = require('../middlewares/ioMiddleware');
const postValidations = require('../validations/postValidations');

const postRouter = (io) => {
  const router = express.Router();

  router.post('/', postValidations.post, ioMiddleware(io), postController.post);
  router.get('/', postController.getAll);
  router.get('/emotions', postController.getEmotions);
  router.put(
    '/emotion/:postId',
    postValidations.releaseEmotion,
    ioMiddleware(io),
    postController.releaseEmotion
  );
  router.delete(
    '/emotion/:postId',
    postValidations.cancelReleasedEmotion,
    ioMiddleware(io),
    postController.cancelReleasedEmotion
  );
  router.get(
    '/user/:userId',
    postValidations.getUserPosts,
    postController.getUserPosts
  );
  router.get(
    '/comments/:postId',
    postValidations.getComments,
    postController.getComments
  );
  router.post(
    '/comment',
    postValidations.comment,
    ioMiddleware(io),
    postController.comment
  );

  return router;
};

module.exports = postRouter;
