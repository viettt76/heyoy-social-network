const express = require('express');
const relationshipController = require('../controllers/RelationshipController');
const ioMiddleware = require('../middlewares/ioMiddleware');
const relationshipValidations = require('../validations/relationshipValidations');

const relationshipRouter = (io) => {
  const router = express.Router();

  router.get('/friends/:userId', relationshipController.friends);
  router.get('/suggestion', relationshipController.suggestion);
  router.post(
    '/request',
    relationshipValidations.request,
    ioMiddleware(io),
    relationshipController.request
  );
  router.get('/request', relationshipController.friendRequests);
  router.delete(
    '/request/:senderId',
    relationshipValidations.refuseFriendRequest,
    ioMiddleware(io),
    relationshipController.refuseFriendRequest
  );
  router.post(
    '/accept',
    relationshipValidations.accept,
    ioMiddleware(io),
    relationshipController.accept
  );
  router.delete(
    '/:friendId',
    relationshipValidations.unfriend,
    ioMiddleware(io),
    relationshipController.unfriend
  );
  router.get('/sent-requests', relationshipController.sentFriendRequests);
  router.delete(
    '/sent-request/:receiverId',
    relationshipValidations.cancelFriendRequest,
    ioMiddleware(io),
    relationshipController.cancelFriendRequest
  );

  return router;
};
module.exports = relationshipRouter;
