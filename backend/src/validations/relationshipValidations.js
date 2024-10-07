const Joi = require('joi');
const validationHandler = require('../utils/validationHandler');

const request = (req, res, next) => {
  const correctValidation = Joi.object({
    relationship: Joi.number().integer().allow(null),
    receiverId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const refuseFriendRequest = (req, res, next) => {
  const correctValidation = Joi.object({
    senderId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const accept = (req, res, next) => {
  const correctValidation = Joi.object({
    friendId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.body, res, next);
};

const unfriend = (req, res, next) => {
  const correctValidation = Joi.object({
    friendId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

const cancelFriendRequest = (req, res, next) => {
  const correctValidation = Joi.object({
    receiverId: Joi.string().uuid().required(),
  });

  validationHandler(correctValidation, req.params, res, next);
};

module.exports = {
  request,
  refuseFriendRequest,
  accept,
  unfriend,
  cancelFriendRequest,
};
